#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$(readlink -f "$0")")"
if [[ ! -d .venv ]]; then
  if ! python3 -m venv .venv; then
    echo "[OMNITRACE] Virtual environment creation failed. On Kali run: sudo apt install python3-venv python3-pip" >&2
    exit 1
  fi
fi
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[test]'
python -m pytest --cov=backend.app --cov-report=term-missing -q
if command -v node >/dev/null 2>&1; then
  node --check frontend/app.js
  echo "JavaScript syntax check: PASS"
else
  echo "Node.js not found; skipped JavaScript syntax check."
fi
