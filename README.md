<div align="center">
  <img src="docs/assets/omnitrace-preview.svg" alt="OMNITRACE dark intelligence workspace preview" width="100%" />
  <br />
  <h1>OMNITRACE</h1>
  <p><strong>Open-Source Intelligence & Cyber Investigation Workspace</strong></p>
  <p>Follow public signals. Organize leads. Preserve context. Keep conclusions evidence-led.</p>
  <p>
    <a href="https://github.com/raxwqx/OMNITRACE"><img src="https://img.shields.io/badge/version-0.5.1-9cffb5?style=for-the-badge&labelColor=101713" alt="Version 0.5.1" /></a>
    <img src="https://img.shields.io/badge/Python-3.11%2B-9bdcff?style=for-the-badge&logo=python&logoColor=white&labelColor=101713" alt="Python 3.11 or newer" />
    <img src="https://img.shields.io/badge/FastAPI-API-9cffb5?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=101713" alt="FastAPI" />
    <img src="https://img.shields.io/badge/UI-Turkish%20%2F%20English-c5a6ff?style=for-the-badge&labelColor=101713" alt="Turkish and English UI" />
    <img src="https://img.shields.io/badge/License-MIT-f3d58a?style=for-the-badge&labelColor=101713" alt="MIT License" />
  </p>
  <p>
    <a href="#-features">Features</a> ·
    <a href="#-quick-start">Quick start</a> ·
    <a href="#-screens-and-modules">Modules</a> ·
    <a href="#-api-examples">API examples</a> ·
    <a href="#-security-and-responsible-use">Responsible use</a>
  </p>
</div>

> **Preview note:** The image above is an illustrative interface preview based on the current OMNITRACE layout, not a live screenshot. The app runs locally in your browser.

OMNITRACE is a modular starter workspace for **authorized, public-source OSINT research**. It brings identity leads, IP and domain context, indicator triage, analyst utilities, and investigation notes into one bilingual interface. The goal is not to magically identify people; it is to help analysts structure leads, record context, and keep uncertainty visible.

**Current release:** `v0.5.1` · **Platform:** local-first web application · **Backend:** FastAPI · **Database:** SQLite by default, PostgreSQL supported

---

## 🧭 Contents

- [Why OMNITRACE?](#-why-omnitrace)
- [Features](#-features)
- [Screens and modules](#-screens-and-modules)
- [Architecture](#-architecture-at-a-glance)
- [Quick start](#-quick-start)
- [Docker and PostgreSQL](#-docker-and-postgresql)
- [API examples](#-api-examples)
- [Testing](#-testing)
- [Project structure](#-project-structure)
- [Security and responsible use](#-security-and-responsible-use)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

## 🧩 Why OMNITRACE?

OSINT work can get scattered across browser tabs, terminal commands, text files, and case notes. OMNITRACE gives those small tasks a shared workspace with a consistent workflow:

1. **Collect a lead** from a public source or a user-provided indicator.
2. **Inspect the context** with focused parsing and lookup helpers.
3. **Record scope and notes** in an investigation notebook.
4. **Export or reuse results** in JSON, CSV, or quick reports.
5. **Keep uncertainty explicit.** A candidate is a lead, not a verified conclusion.

### Design principles

- **Passive-first:** no port scanning, exploitation, or arbitrary URL fetching.
- **Evidence-aware:** distinguish a candidate, a parsed value, and a verified fact.
- **Local-first:** the interface and analyst utilities are designed for local use.
- **Bilingual:** Turkish and English interface labels.
- **Modular:** a foundation for carefully scoped provider adapters and future case workflows.

## ✨ Features

| Module | What it does | Important boundary |
|---|---|---|
| **Identity Intelligence** | Generates candidate public-profile URLs from a fixed provider registry; supports platform selection and recent search history. | URLs are not automatically checked. Username similarity does not establish identity. |
| **IP Intelligence** | Validates IPv4/IPv6 and classifies global, private, loopback, and reserved ranges; links to public RDAP records. | No guaranteed geolocation, ownership, reputation, or safety verdict. |
| **Domain & DNS** | Bounded A, AAAA, MX, NS, and TXT lookups, with RDAP and Certificate Transparency search links. | DNS needs network access and may time out or return no records. |
| **Passive subdomain discovery** | Uses public Certificate Transparency records to discover certificate-listed names. | Does not probe discovered hosts. Public records may be incomplete or stale. |
| **Email domain check** | Validates email syntax and checks whether the domain publishes public MX records. | Does not verify a mailbox or prove that a person controls it. |
| **URL inspector** | Parses HTTP(S) URL components locally and highlights basic indicators. | The submitted URL is not fetched by this tool. |
| **Hash identifier** | Recognizes common hexadecimal digest lengths and offers optional external lookup links. | Length-based algorithm identification can be ambiguous; reputation is not queried automatically. |
| **Bulk IOC triage** | Classifies and deduplicates up to 100 IPs, domains, URLs, email addresses, and common hashes. | Classification is a helper, not a threat verdict. |
| **Investigation notebook** | Stores investigation titles, scope, and notes in the configured database. | Current starter is not a multi-user case-management service. |
| **Analyst Lab** | Ten browser-local utilities for preparing and organizing data. | Outputs still need analyst review and corroboration. |
| **Workspace settings** | Matrix green, cyber blue, signal purple, or amber accents; compact layout and motion preference. | Preferences are stored in the current browser. |
| **Exports** | Identity results as JSON/CSV, copied candidate URLs, and timestamped quick reports. | Exported leads retain their unverified status. |

### Analyst Lab: 10 local-first utilities

<details>
<summary><strong>Open the utility list</strong></summary>

1. IOC extractor for likely IPs, domains, URLs, emails, and hashes in pasted text.
2. Defang/refang helper for safely sharing indicators.
3. Base64 text encode/decode with UTF-8 support.
4. URL-component encode/decode.
5. SHA-256 digest of text (not a file hash tool).
6. Unix timestamp converter for seconds or milliseconds.
7. IPv4 CIDR calculator for network, broadcast, and usable-host count.
8. Source-quality checklist.
9. Simple relationship mapper for recording leads.
10. Timestamped quick-report builder.

</details>

## 🖥️ Screens and modules

The interface uses a dark, Matrix-inspired theme with acid-green accents. The startup sequence plays on each fresh page load and can be skipped.

| Screen | Purpose |
|---|---|
| **Overview** | High-level workspace snapshot and module entry points. |
| **Identity Intelligence** | Build candidate profile links across supported platforms and export the result list. |
| **OSINT Toolkit** | Inspect IPs, domains, email domains, URLs, hashes, and bulk indicators. |
| **Investigations** | Keep case scope and research notes together. |
| **Analyst Lab** | Run ten small local-first data preparation utilities in the browser. |
| **Settings** | Switch language and adjust visual preferences. |

## 🏗️ Architecture at a glance

```mermaid
flowchart TD
    A[Browser UI<br/>HTML · CSS · JavaScript] --> B[FastAPI application]
    B --> C[Identity API]
    B --> D[Intelligence API]
    B --> E[Investigation API]
    C --> F[Provider registry<br/>candidate URLs]
    D --> G[IP parsing · DNS · RDAP links<br/>CT search · IOC triage]
    E --> H[SQLAlchemy persistence]
    H --> I[(SQLite local default)]
    H --> J[(PostgreSQL optional)]
    A --> K[Analyst Lab<br/>browser-local utilities]
```

### Technology stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn
- **Data layer:** SQLAlchemy; SQLite for local development; PostgreSQL support for Docker deployments
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Testing:** pytest and FastAPI `TestClient`
- **Packaging:** shell launch/test scripts, Dockerfile, Docker Compose

## 🚀 Quick start

### Option A: launch script (recommended)

On Kali Linux or another Linux distribution with Python 3.11+, extract the release archive, open a terminal in the `OMNITRACE/` folder, and run:

```bash
chmod +x ./run.sh ./test.sh
./run.sh
```

Then open:

- **Web app:** <http://127.0.0.1:8000>
- **Interactive API docs:** <http://127.0.0.1:8000/docs>
- **Health endpoint:** <http://127.0.0.1:8000/api/health>

The launcher creates a project-local virtual environment, installs the app dependencies if needed, and starts the local server. Keep the terminal open while using OMNITRACE. Press `Ctrl+C` to stop it.

### Option B: manual installation

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip

cd OMNITRACE
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[test]'
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

If editable installation is blocked by a local packaging policy, install dependencies directly:

```bash
python -m pip install -r requirements.txt
python -m pip install pytest pytest-cov httpx
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### First-run notes

- Keep the app bound to `127.0.0.1` unless you understand the exposure implications.
- The default local database is SQLite.
- DNS lookups and public record queries require network access.
- The app does not need external OSINT API keys for its current core workflows.
- Do not enter passwords, secrets, or private personal records into research forms.

## 🐳 Docker and PostgreSQL

Docker Compose runs OMNITRACE alongside PostgreSQL and waits for the database health check before starting the app.

```bash
# Set a unique local password for this development environment.
export POSTGRES_PASSWORD='replace-with-a-long-local-password'
docker compose up --build
```

Open <http://127.0.0.1:8000>. The default port binding is loopback-only by design; this is a local deployment configuration, **not** a hardened public production setup.

To stop the services:

```bash
docker compose down
```

To remove the local database volume as well, use `docker compose down -v` only if you intentionally want to delete its stored data.

For PostgreSQL outside Compose, configure `DATABASE_URL` with a SQLAlchemy URL such as:

```text
postgresql+psycopg://user:password@host:5432/omnitrace
```

Install the optional PostgreSQL dependencies with `python -m pip install -e '.[test,postgres]'`. Keep credentials in environment variables or a local `.env` file that is never committed.

## 🔌 API examples

Start OMNITRACE first. The examples below use the local API at `127.0.0.1:8000`.

### Health check

```bash
curl http://127.0.0.1:8000/api/health
```

### Identity candidate search

```bash
curl -X POST http://127.0.0.1:8000/api/identity/search \
  -H 'Content-Type: application/json' \
  -d '{"username":"example_user","platforms":["github","reddit","instagram"]}'
```

The result is a list of candidate URLs. It is not a check that those accounts exist.

### IP intelligence

```bash
curl -X POST http://127.0.0.1:8000/api/intel/ip \
  -H 'Content-Type: application/json' \
  -d '{"value":"8.8.8.8"}'
```

### Domain and DNS records

```bash
curl -X POST http://127.0.0.1:8000/api/intel/domain \
  -H 'Content-Type: application/json' \
  -d '{"value":"example.org"}'
```

### Parse a URL locally

```bash
curl -X POST http://127.0.0.1:8000/api/intel/url \
  -H 'Content-Type: application/json' \
  -d '{"value":"https://example.org/path?q=1"}'
```

The URL parser inspects the supplied string. It does not request the destination URL.

### Batch indicator triage

```bash
curl -X POST http://127.0.0.1:8000/api/intel/batch \
  -H 'Content-Type: application/json' \
  -d '{"indicators":["8.8.8.8","example.org","https://example.org","d41d8cd98f00b204e9800998ecf8427e"]}'
```

### Create and list investigation notes

```bash
curl -X POST http://127.0.0.1:8000/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"Authorized OSINT exercise","notes":"Scope and authorization recorded."}'

curl http://127.0.0.1:8000/api/cases
```

For the full interactive schema, visit <http://127.0.0.1:8000/docs>.

## 🧪 Testing

Run the bundled test script:

```bash
./test.sh
```

Or activate the virtual environment and run:

```bash
python -m pytest -q
```

The test suite uses a temporary SQLite database and mocks external RDAP/Certificate Transparency responses where appropriate. It does not require live OSINT provider access. JavaScript syntax checks are also run when Node.js is available.

## 📁 Project structure

```text
OMNITRACE/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── identity.py       # Identity candidate search API
│   │   │   ├── cases.py          # Investigation notebook API
│   │   │   └── intel.py          # IP, DNS, email, URL, hash, bulk IOC
│   │   ├── core/                 # App configuration
│   │   ├── models/               # Request and response schemas
│   │   ├── services/             # Identity and case services
│   │   ├── db.py                 # SQLAlchemy engine and sessions
│   │   └── main.py               # FastAPI app and static frontend
│   └── tests/                    # API and service tests
├── frontend/
│   ├── index.html                # App shell and views
│   ├── styles.css                # Dark Matrix-inspired theme
│   └── app.js                    # Navigation and browser-side tools
├── docs/assets/
│   └── omnitrace-preview.svg     # README interface illustration
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
├── run.sh                        # Local launcher
├── test.sh                       # Test runner
├── CHANGELOG.md
└── LICENSE
```

## 🛡️ Security and responsible use

OMNITRACE is a research starter, **not yet a hardened multi-user public service**. Before exposing any deployment to the internet, address at least the following:

- Add authentication, authorization, and per-user case isolation.
- Review CSRF protections, trusted-host handling, CORS, and HTTPS termination.
- Add rate limits, audit logs, backup/restore, data-retention controls, and secret management.
- Keep integrations allowlisted. Never turn user input into arbitrary server-side fetches; that can create SSRF risk.
- Follow source-provider terms, API rules, privacy requirements, and applicable law.
- Record provenance, retrieval time, scope, and confidence for future enrichment adapters.
- Do not treat username similarity, an IP address, or a single public record as proof of identity or intent.

### Data interpretation rules

- **Candidate ≠ confirmed account.** A generated profile URL may not exist.
- **Public ≠ accurate.** Public records can be stale, incomplete, or misleading.
- **Parsed ≠ safe.** A syntactically valid indicator has no automatic safety verdict.
- **Correlation ≠ identity.** Similar usernames or shared infrastructure are not proof that two entities are the same person.
- **Analyst tools ≠ source of truth.** Review and corroborate outputs before making decisions.

## 🗺️ Roadmap

Planned work, subject to design and testing:

- **v0.6:** database migrations, authentication, and user-scoped investigations.
- **v0.6+:** evidence graph, timeline, and richer HTML/JSON reports.
- **Future adapters:** opt-in threat-intelligence integrations with explicit API keys, source provenance, and rate-limit handling.
- **v1.0:** deployment hardening, integration tests, and operational documentation.

Roadmap items are plans, not features promised in the current release.

## 🤝 Contributing

Issues, careful bug reports, documentation improvements, and scoped pull requests are welcome.

1. Open an issue describing the problem or proposed change.
2. Keep changes focused and document any new data collection or network behavior.
3. Add or update tests for behavior changes.
4. Run `./test.sh` before submitting a pull request.
5. Never include API keys, personal data, investigation records, or real-world sensitive indicators in test fixtures.

## 📜 License

Released under the [MIT License](LICENSE).

---

<div align="center">
  <strong>OMNITRACE</strong><br />
  <sub>Built for responsible public-source research · v0.5.1</sub><br />
  <sub>TR / EN · Local-first · Evidence-aware</sub>
</div>
