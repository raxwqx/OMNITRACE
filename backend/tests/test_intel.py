from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.intel import classify_indicator

client = TestClient(app)

def test_ip_intelligence_classifies_public_ip():
    response = client.post('/api/intel/ip', json={'value': '8.8.8.8'})
    assert response.status_code == 200
    data = response.json()
    assert data['type'] == 'ip'
    assert data['version'] == 4
    assert data['is_global'] is True
    assert data['rdap_url'] == 'https://rdap.org/ip/8.8.8.8'

def test_ip_intelligence_rejects_invalid_address():
    response = client.post('/api/intel/ip', json={'value': '999.999.1.1'})
    assert response.status_code == 422

def test_url_inspector_never_fetches_url_and_reports_http():
    response = client.post('/api/intel/url', json={'value': 'http://example.org/path?q=1'})
    assert response.status_code == 200
    data = response.json()
    assert data['host'] == 'example.org'
    assert data['scheme'] == 'http'
    assert data['query_present'] is True
    assert any('unencrypted' in note for note in data['security_notes'])
    assert 'did not fetch' in data['note']

def test_url_inspector_rejects_non_http_scheme():
    response = client.post('/api/intel/url', json={'value': 'file:///etc/passwd'})
    assert response.status_code == 422

def test_hash_identifier_recognizes_sha256_length():
    digest = 'a' * 64
    response = client.post('/api/intel/hash', json={'value': digest})
    assert response.status_code == 200
    assert response.json()['algorithm_candidate'] == 'SHA-256'
    assert response.json()['format_valid'] is True

def test_bulk_triage_deduplicates_and_classifies():
    response = client.post('/api/intel/batch', json={'indicators': [
        '8.8.8.8', 'EXAMPLE.ORG', 'https://example.org', '8.8.8.8', 'a' * 64
    ]})
    assert response.status_code == 200
    data = response.json()
    assert data['count'] == 4
    assert data['counts_by_type']['ip'] == 1
    assert data['counts_by_type']['domain'] == 1
    assert data['counts_by_type']['url'] == 1
    assert data['counts_by_type']['hash'] == 1

def test_domain_endpoint_rejects_invalid_domain_before_dns():
    response = client.post('/api/intel/domain', json={'value': 'not a domain'})
    assert response.status_code == 422

def test_email_check_does_not_claim_mailbox_verification(monkeypatch):
    import dns.resolver
    monkeypatch.setattr(dns.resolver, "resolve", lambda *args, **kwargs: (_ for _ in ()).throw(dns.resolver.NoAnswer))
    response = client.post('/api/intel/email', json={'value': 'analyst@example.org'})
    assert response.status_code == 200
    assert 'does not verify a mailbox' in response.json()['note']

def test_local_classifier_flags_private_ip():
    data = classify_indicator('192.168.1.10')
    assert data['type'] == 'ip'
    assert data['is_private'] is True



def test_subdomain_discovery_rejects_invalid_domain_without_provider_request():
    response = client.post('/api/intel/subdomains', json={'value': 'not a domain'})
    assert response.status_code == 422

def test_ip_rdap_rejects_private_ip_without_provider_request():
    response = client.post('/api/intel/ip-rdap', json={'value': '192.168.1.10'})
    assert response.status_code == 422


def test_ipv6_loopback_is_classified_without_network_access():
    response = client.post("/api/intel/ip", json={"value": "::1"})
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == 6
    assert data["is_loopback"] is True
    assert data["is_global"] is False


def test_batch_rejects_more_than_one_hundred_items():
    response = client.post("/api/intel/batch", json={"indicators": ["example.org"] * 101})
    assert response.status_code == 422


def test_batch_rejects_all_blank_items():
    response = client.post("/api/intel/batch", json={"indicators": ["", "   "]})
    assert response.status_code == 422


def test_hash_endpoint_rejects_non_hex_digest():
    response = client.post("/api/intel/hash", json={"value": "g" * 64})
    assert response.status_code == 422


def test_url_inspector_rejects_invalid_port():
    response = client.post("/api/intel/url", json={"value": "https://example.org:99999/"})
    assert response.status_code == 422


def test_email_rejects_malformed_address():
    response = client.post("/api/intel/email", json={"value": "not-an-email"})
    assert response.status_code == 422


def test_domain_normalizes_case_and_trailing_dot(monkeypatch):
    import dns.resolver
    monkeypatch.setattr(dns.resolver, "resolve", lambda *args, **kwargs: (_ for _ in ()).throw(dns.resolver.NoAnswer))
    response = client.post("/api/intel/domain", json={"value": "EXAMPLE.ORG."})
    assert response.status_code == 200
    assert response.json()["domain"] == "example.org"


def test_ip_rdap_provider_result_is_safely_serialized(monkeypatch):
    from backend.app.api import intel
    monkeypatch.setattr(intel, "_fetch_public_json", lambda url, **kwargs: {
        "name": "TEST-NET", "handle": "TEST-1", "startAddress": "8.8.8.0",
        "endAddress": "8.8.8.255", "country": "US", "type": "DIRECT ALLOCATION",
        "entities": [{"handle": "EXAMPLE", "roles": ["registrant"]}],
        "events": [{"eventAction": "registration", "eventDate": "2020-01-01T00:00:00Z"}],
    })
    response = client.post("/api/intel/ip-rdap", json={"value": "8.8.8.8"})
    assert response.status_code == 200
    data = response.json()
    assert data["network_name"] == "TEST-NET"
    assert data["entities"][0]["handle"] == "EXAMPLE"
    assert data["events"][0]["action"] == "registration"


def test_subdomain_discovery_filters_outside_names_and_deduplicates(monkeypatch):
    from backend.app.api import intel
    monkeypatch.setattr(intel, "_fetch_public_json", lambda url, **kwargs: [
        {"name_value": "www.example.org\n*.example.org"},
        {"name_value": "api.example.org."},
        {"name_value": "example.org.evil.test\nother.test"},
    ])
    response = client.post("/api/intel/subdomains", json={"value": "EXAMPLE.ORG."})
    assert response.status_code == 200
    data = response.json()
    assert data["subdomains"] == ["api.example.org", "example.org", "www.example.org"]
    assert data["count"] == 3


def test_provider_failure_returns_gateway_error(monkeypatch):
    from urllib.error import URLError
    from backend.app.api import intel
    def fail(*args, **kwargs):
        raise URLError("offline")
    monkeypatch.setattr(intel, "_fetch_public_json", fail)
    response = client.post("/api/intel/ip-rdap", json={"value": "8.8.8.8"})
    assert response.status_code == 502
    assert "provider unavailable" in response.json()["detail"].lower()
