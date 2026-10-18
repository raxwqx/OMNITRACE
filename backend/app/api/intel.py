"""Safe, bounded OSINT utilities: validate and enrich public indicators only."""
from __future__ import annotations

import hashlib
import ipaddress
import re
import json
from urllib.parse import urlparse, urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

import dns.resolver
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/api/intel", tags=["OSINT Intelligence"])

class IndicatorRequest(BaseModel):
    value: str = Field(min_length=1, max_length=2048)

    @field_validator("value")
    @classmethod
    def strip_value(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Indicator cannot be blank.")
        return value

class BatchRequest(BaseModel):
    indicators: list[str] = Field(min_length=1, max_length=100)

    @field_validator("indicators")
    @classmethod
    def clean_indicators(cls, values: list[str]) -> list[str]:
        cleaned = [v.strip() for v in values if v.strip()]
        if not cleaned:
            raise ValueError("Provide at least one indicator.")
        if any(len(v) > 2048 for v in cleaned):
            raise ValueError("Each indicator must be 2048 characters or fewer.")
        return cleaned

DOMAIN_RE = re.compile(r"^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$")
EMAIL_RE = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9.-]{1,253}$")
HASH_LENGTHS = {32: "MD5", 40: "SHA-1", 56: "SHA-224", 64: "SHA-256", 96: "SHA-384", 128: "SHA-512"}


def validate_domain(value: str) -> str:
    domain = value.strip().rstrip(".").lower()
    if not DOMAIN_RE.fullmatch(domain) or ".." in domain:
        raise ValueError("Enter a valid domain name, e.g. example.org.")
    return domain


def classify_indicator(value: str) -> dict:
    raw = value.strip()
    try:
        address = ipaddress.ip_address(raw)
        return {"indicator": raw, "type": "ip", "normalized": str(address), "version": address.version,
                "is_global": address.is_global, "is_private": address.is_private,
                "is_loopback": address.is_loopback, "is_reserved": address.is_reserved,
                "is_multicast": address.is_multicast,
                "rdap_url": f"https://rdap.org/ip/{address}"}
    except ValueError:
        pass
    if re.fullmatch(r"(?i)[0-9a-f]+", raw) and len(raw) in HASH_LENGTHS:
        return {"indicator": raw, "type": "hash", "algorithm_candidates": [HASH_LENGTHS[len(raw)]],
                "note": "Length-based classification only; hashes are not reputation-checked."}
    if EMAIL_RE.fullmatch(raw) and ".." not in raw:
        local, domain = raw.rsplit("@", 1)
        if DOMAIN_RE.fullmatch(domain) and not domain.startswith("-"):
            return {"indicator": raw, "type": "email", "normalized_domain": domain.lower(),
                    "note": "Syntax only; mailbox existence and ownership are not verified."}
    if "://" in raw:
        parsed = urlparse(raw)
        if parsed.scheme.lower() in {"http", "https"} and parsed.hostname:
            try:
                host = validate_domain(parsed.hostname) if not _is_ip(parsed.hostname) else str(ipaddress.ip_address(parsed.hostname))
            except ValueError:
                return {"indicator": raw, "type": "unknown", "error": "Invalid URL host."}
            try:
                port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
            except ValueError:
                return {"indicator": raw, "type": "unknown", "error": "URL port is invalid."}
            return {"indicator": raw, "type": "url", "scheme": parsed.scheme.lower(), "host": host,
                    "port": port,
                    "path_present": bool(parsed.path and parsed.path != "/"),
                    "query_present": bool(parsed.query), "fragment_present": bool(parsed.fragment),
                    "note": "Parsed locally only; the URL was not requested or opened."}
        return {"indicator": raw, "type": "unknown", "error": "Only absolute HTTP/HTTPS URLs are supported."}
    try:
        domain = validate_domain(raw)
        return {"indicator": raw, "type": "domain", "normalized": domain,
                "rdap_url": f"https://rdap.org/domain/{domain}",
                "certificate_search_url": f"https://crt.sh/?q=%25.{domain}"}
    except ValueError:
        return {"indicator": raw, "type": "unknown", "error": "Not recognized as an IP, domain, email, HTTP(S) URL, or common hash."}


def _is_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False




def _fetch_public_json(url: str, *, timeout: float = 5.0, max_bytes: int = 2_000_000):
    """Fetch JSON only from fixed, public OSINT providers with a strict size/time bound."""
    request = Request(url, headers={"User-Agent": "OMNITRACE-OSINT/0.4.1 (passive research)", "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        content_type = response.headers.get("Content-Type", "")
        if response.status != 200:
            raise RuntimeError(f"Provider returned HTTP {response.status}")
        raw = response.read(max_bytes + 1)
        if len(raw) > max_bytes:
            raise RuntimeError("Provider response exceeded the size limit")
        return json.loads(raw.decode("utf-8"))


@router.post("/ip-rdap")
def inspect_ip_rdap(payload: IndicatorRequest):
    """Retrieve registration-network metadata for a public IP via the RDAP aggregator."""
    try:
        address = ipaddress.ip_address(payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Enter a valid IPv4 or IPv6 address.") from exc
    if not address.is_global:
        raise HTTPException(status_code=422, detail="RDAP enrichment is limited to globally routable IP addresses.")
    try:
        data = _fetch_public_json(f"https://rdap.org/ip/{address}")
    except (URLError, HTTPError, TimeoutError, OSError, ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=f"RDAP provider unavailable: {type(exc).__name__}") from exc
    events = data.get("events", []) if isinstance(data, dict) else []
    entities = data.get("entities", []) if isinstance(data, dict) else []
    return {
        "ip": str(address), "version": address.version,
        "network_name": data.get("name"), "handle": data.get("handle"),
        "start_address": data.get("startAddress"), "end_address": data.get("endAddress"),
        "country": data.get("country"), "type": data.get("type"),
        "entities": [{"handle": e.get("handle"), "roles": e.get("roles", [])} for e in entities if isinstance(e, dict)],
        "events": [{"action": e.get("eventAction"), "date": e.get("eventDate")} for e in events if isinstance(e, dict)],
        "rdap_url": f"https://rdap.org/ip/{address}",
        "note": "Registry metadata describes address allocation, not the physical location of a person or device. ASN details may not be present in every RDAP response."
    }


@router.post("/subdomains")
def discover_subdomains(payload: IndicatorRequest):
    """Discover names from certificate-transparency records; never probes discovered hosts."""
    try:
        domain = validate_domain(payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    query = urlencode({"q": f"%.{domain}", "output": "json"})
    try:
        data = _fetch_public_json(f"https://crt.sh/?{query}", timeout=7.0, max_bytes=2_000_000)
    except (URLError, HTTPError, TimeoutError, OSError, ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=f"Certificate transparency source unavailable: {type(exc).__name__}") from exc
    names: set[str] = set()
    if isinstance(data, list):
        for row in data:
            if not isinstance(row, dict):
                continue
            for raw_name in str(row.get("name_value", "")).splitlines():
                name = raw_name.strip().lower().lstrip("*.").rstrip(".")
                if name == domain or name.endswith("." + domain):
                    names.add(name)
    results = sorted(names)[:5000]
    return {
        "domain": domain, "source": "crt.sh / Certificate Transparency",
        "count": len(results), "subdomains": results,
        "source_url": f"https://crt.sh/?q=%25.{domain}",
        "note": "Names are derived from public certificate records. They may be stale, duplicated across certificates, or no longer resolve. OMNITRACE does not scan or contact discovered hosts."
    }


@router.post("/ip")
def inspect_ip(payload: IndicatorRequest):
    try:
        address = ipaddress.ip_address(payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Enter a valid IPv4 or IPv6 address.") from exc
    result = classify_indicator(str(address))
    result["rdap_note"] = "Open the public RDAP record to review registry data; no location is inferred from the address."
    return result


@router.post("/domain")
def inspect_domain(payload: IndicatorRequest):
    try:
        domain = validate_domain(payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    records: dict[str, list[str]] = {kind: [] for kind in ("A", "AAAA", "MX", "NS", "TXT")}
    errors: dict[str, str] = {}
    for kind in records:
        try:
            answers = dns.resolver.resolve(domain, kind, lifetime=2.0, raise_on_no_answer=False)
            records[kind] = [str(answer).strip('"') for answer in answers] if answers.rrset else []
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            records[kind] = []
        except (dns.resolver.NoNameservers, dns.resolver.LifetimeTimeout, dns.exception.DNSException) as exc:
            errors[kind] = type(exc).__name__
    return {"domain": domain, "records": records, "lookup_errors": errors,
            "rdap_url": f"https://rdap.org/domain/{domain}",
            "certificate_search_url": f"https://crt.sh/?q=%25.{domain}",
            "note": "DNS answers are time-sensitive and do not prove ownership or maliciousness."}


@router.post("/email")
def inspect_email(payload: IndicatorRequest):
    value = payload.value
    if not EMAIL_RE.fullmatch(value) or ".." in value:
        raise HTTPException(status_code=422, detail="Enter an email address in a valid format.")
    local, domain_raw = value.rsplit("@", 1)
    try:
        domain = validate_domain(domain_raw)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="The email domain is invalid.") from exc
    mx: list[str] = []
    status = "unknown"
    try:
        answers = dns.resolver.resolve(domain, "MX", lifetime=2.0, raise_on_no_answer=False)
        mx = sorted(str(answer.exchange).rstrip(".") for answer in answers) if answers.rrset else []
        status = "records_found" if mx else "no_mx_record_found"
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        status = "no_mx_record_found"
    except dns.exception.DNSException as exc:
        status = "lookup_error"
        mx = []
    return {"address": value, "local_part_present": bool(local), "domain": domain,
            "mx_status": status, "mx_records": mx,
            "note": "This checks syntax and public mail-routing records only. It does not verify a mailbox, owner, or account."}


@router.post("/url")
def inspect_url(payload: IndicatorRequest):
    result = classify_indicator(payload.value)
    if result.get("type") != "url":
        raise HTTPException(status_code=422, detail="Enter a valid absolute HTTP or HTTPS URL.")
    parsed = urlparse(payload.value)
    result["username_in_url"] = parsed.username is not None
    result["contains_query_parameters"] = bool(parsed.query)
    result["security_notes"] = []
    if parsed.scheme.lower() == "http":
        result["security_notes"].append("HTTP is unencrypted; prefer HTTPS where available.")
    if parsed.username is not None or parsed.password is not None:
        result["security_notes"].append("URL contains user-info credentials; treat it as sensitive and do not share it casually.")
    result["note"] = "Analysis is local only. OMNITRACE did not fetch, follow redirects, or open this URL."
    return result


@router.post("/hash")
def inspect_hash(payload: IndicatorRequest):
    value = payload.value.lower()
    if not re.fullmatch(r"[0-9a-f]+", value) or len(value) not in HASH_LENGTHS:
        raise HTTPException(status_code=422, detail="Enter a hexadecimal digest with a common hash length (32, 40, 56, 64, 96, or 128).")
    algorithm = HASH_LENGTHS[len(value)]
    return {"hash": value, "algorithm_candidate": algorithm, "hex_length": len(value),
            "format_valid": True, "lookup_links": [
                {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/search/{value}"},
                {"name": "MalwareBazaar", "url": f"https://bazaar.abuse.ch/browse.php?search={value}"}],
            "note": "Algorithm is inferred from digest length and can be ambiguous; reputation is not queried automatically."}


@router.post("/batch")
def batch_triage(payload: BatchRequest):
    unique: list[str] = []
    seen: set[str] = set()
    for item in payload.indicators:
        key = item.strip()
        if key.casefold() not in seen:
            seen.add(key.casefold())
            unique.append(key)
    results = [classify_indicator(item) for item in unique]
    counts: dict[str, int] = {}
    for item in results:
        counts[item["type"]] = counts.get(item["type"], 0) + 1
    return {"count": len(results), "counts_by_type": counts, "results": results,
            "note": "Batch triage is local and passive; it does not contact target hosts or verify account ownership."}
