# OMNITRACE

**Public-source OSINT & Cyber Intelligence Workspace**  
Version: `0.5.1` · Python 3.11+ · FastAPI

OMNITRACE is a modular starter for authorized, public-source research. It provides a dark web dashboard, username-to-public-profile candidate discovery, bilingual identity research, persistent search history, exportable results, an investigation notebook, and passive indicator triage tools backed by SQLAlchemy. SQLite is supported for local development; PostgreSQL is the recommended Pro deployment database.

> **Important:** profile URLs are *candidates*, not verified accounts. A matching username does not prove that accounts belong to the same person. This starter does not log in to social networks, bypass access controls, scrape private content, or claim that a profile exists.

## Current features

- Responsive Matrix-inspired black/acid-green dashboard with a one-time, skippable startup intro on first visit after this release.
- Username input validation and candidate URL generation from a fixed provider registry.
- Clear `not_checked` status for each candidate; no false existence claims.
- Platform categories and recent identity-search history.
- Export identity results as JSON or CSV, or copy candidate URLs.
- Turkish and English interface with remembered language preference.
- SQLAlchemy persistence with SQLite for local development and PostgreSQL for Docker deployments.
- Health endpoint and automated tests.
- **IP Intelligence:** validates IPv4/IPv6 and labels global/private/loopback/reserved properties; links to public RDAP records.
- **Domain & DNS:** bounded A, AAAA, MX, NS and TXT DNS lookups, plus RDAP and certificate-transparency search links.
- **Email domain check:** validates syntax and checks public MX records without claiming mailbox existence.
- **URL inspector:** parses HTTP(S) URL structure locally and highlights basic indicators; never fetches the submitted URL.
- **Hash identifier:** recognizes common hexadecimal digest lengths and provides optional external reputation lookup links.
- **Bulk IOC triage:** locally classifies and deduplicates up to 100 IPs, domains, URLs, email addresses and common hashes.
- **Passive subdomain discovery:** finds names from public Certificate Transparency records without probing hosts.
- **Investigation notebook:** save scope and notes in the configured database, with recent identity-search history.
- **Analyst Lab (10 browser-local utilities):** extract likely IOCs from text; defang/refang indicators; Base64 encode/decode; URL-component encode/decode; SHA-256 text digest; Unix timestamp conversion; IPv4 CIDR calculator; source-quality checklist; relationship mapper; timestamped quick-report builder.
- **Workspace personalization:** Matrix green, cyber blue, signal purple or amber accent; compact layout; reduced-motion preference. Saved in the current browser.
- All major screens are available in Turkish and English.
- Docker packaging, PostgreSQL health checks, non-root container user, and loopback-only default port mapping.

## Stack

- FastAPI / Uvicorn
- SQLAlchemy (SQLite for local use, PostgreSQL for Pro deployment)
- HTML, CSS and vanilla JavaScript
- pytest + FastAPI TestClient

## Run locally on Kali Linux

The release ZIP extracts into one `OMNITRACE/` folder so files do not scatter through Downloads. Open a terminal in that folder and run:

```bash
chmod +x ./run.sh ./test.sh
./run.sh
```

The launcher creates a project-local virtual environment, installs the app dependencies if needed, then starts the server on `127.0.0.1:8000`. Open `http://127.0.0.1:8000`. API documentation is at `http://127.0.0.1:8000/docs`. Keep the terminal open while using the app and stop the server with `Ctrl+C`.

Manual setup is also supported:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[test]'
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`.

If editable installation fails due to a local packaging policy, use `pip install -r requirements.txt` and `pip install pytest pytest-cov httpx`, then run the same `uvicorn` command.

## Run tests

```bash
./test.sh
```

Or, with the virtual environment activated, run `python -m pytest -q`. The suite uses a temporary SQLite database and does not require live OSINT-provider access; external RDAP and certificate-transparency responses are mocked. JavaScript syntax checks run when Node.js is installed.

## Run with Docker (PostgreSQL)

```bash
# Optional: set a unique local database password first
export POSTGRES_PASSWORD='replace-with-a-long-local-password'
docker compose up --build
```

Open `http://127.0.0.1:8000`. Docker Compose starts PostgreSQL and waits for its health check before starting OMNITRACE. The application port is bound to `127.0.0.1` on purpose. This is a local deployment setup, not a hardened public production deployment.

For local development without Docker, unset `DATABASE_URL` and OMNITRACE uses SQLite by default. For PostgreSQL outside Compose, set `DATABASE_URL` to a SQLAlchemy URL such as `postgresql+psycopg://user:password@host:5432/omnitrace` and install dependencies with `pip install -e ".[test,postgres]"`.

## OSINT toolkit API examples

```bash
# IP metadata and RDAP link
curl -X POST http://127.0.0.1:8000/api/intel/ip \
  -H 'Content-Type: application/json' -d '{"value":"8.8.8.8"}'

# Public DNS records (A, AAAA, MX, NS, TXT)
curl -X POST http://127.0.0.1:8000/api/intel/domain \
  -H 'Content-Type: application/json' -d '{"value":"example.org"}'

# URL is parsed locally, not requested
curl -X POST http://127.0.0.1:8000/api/intel/url \
  -H 'Content-Type: application/json' -d '{"value":"https://example.org/path?q=1"}'

# Bulk local indicator classification
curl -X POST http://127.0.0.1:8000/api/intel/batch \
  -H 'Content-Type: application/json' \
  -d '{"indicators":["8.8.8.8","example.org","https://example.org","d41d8cd98f00b204e9800998ecf8427e"]}'
```

DNS queries require network access and may return no records or timeout. IP and URL parsing do not imply geolocation, ownership, safety, or reputation. Hash algorithms are inferred from length and may be ambiguous. External lookup links are optional and are not queried automatically.

## API quickstart

```bash
curl http://127.0.0.1:8000/api/health

curl -X POST http://127.0.0.1:8000/api/identity/search \
  -H 'Content-Type: application/json' \
  -d '{"username":"example_user","platforms":["github","reddit","instagram"]}'

curl -X POST http://127.0.0.1:8000/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"Authorized OSINT exercise","notes":"Scope and authorization recorded."}'

curl http://127.0.0.1:8000/api/cases
```

## Project layout

```text
backend/app/
  api/identity.py       Identity search endpoint
  api/cases.py          Case notebook endpoints
  api/intel.py          IP, DNS/domain, email, URL, hash and bulk IOC tools
  core/config.py        Environment configuration
  models/schemas.py     Request/response validation
  services/identity/    Provider registry and candidate builder
  services/cases.py     SQLAlchemy case persistence
  services/identity/history.py  Search history persistence
  db.py                 SQLAlchemy engine and sessions
  main.py               FastAPI app and static frontend
backend/tests/          Automated tests
frontend/               Static UI assets
```

## Security and deployment notes

This is a working **starter**, not yet a hardened multi-user public service. Before exposing it to the internet:

1. Add authentication, authorization, CSRF protection where applicable, and per-user case isolation.
2. Put it behind HTTPS and a reverse proxy; configure trusted hosts and strict CORS.
3. Add rate limits, audit logging, backup/restore, retention controls, and secret management.
4. Keep provider integrations on an allowlist. Do not accept arbitrary fetch URLs from users; that can create SSRF risk.
5. Follow each provider's terms, robots policies, API access rules, and applicable law.
6. Add API adapters one by one and record provenance, retrieval time, and confidence. Never treat username similarity as identity proof.

## Roadmap

- `v0.5`: opt-in threat-intelligence API connectors with explicit keys, provenance, rate-limit handling, and the planned provider adapter interface.
- `v0.6`: database migrations, authentication and user-scoped investigations remain planned.
- `v0.6`: evidence graph, timeline, and richer HTML/JSON reports.
- `v1.0`: deployment hardening, migrations, integration tests, and documented operational controls.

## License

MIT. See `LICENSE`.


## Interface languages

The interface supports Turkish and English. Use the **TR / EN** control in the top bar to switch languages; your choice is remembered in the browser.
