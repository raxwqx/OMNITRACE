#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$(readlink -f "$0")")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[OMNITRACE] Python 3 is required. On Kali: sudo apt install python3 python3-venv python3-pip" >&2
  exit 1
fi

if [[ ! -d .venv ]]; then
  echo "[OMNITRACE] Creating project virtual environment..."
  if ! python3 -m venv .venv; then
    echo "[OMNITRACE] Virtual environment creation failed. On Kali run: sudo apt install python3-venv python3-pip" >&2
    exit 1
  fi
fi
# shellcheck disable=SC1091
source .venv/bin/activate
if ! python -c 'import fastapi, sqlalchemy, dns, uvicorn' >/dev/null 2>&1; then
  echo "[OMNITRACE] Installing application dependencies..."
  python -m pip install --upgrade pip
  python -m pip install -e .
fi

host="${OMNITRACE_HOST:-127.0.0.1}"
port="${OMNITRACE_PORT:-8000}"
echo "[OMNITRACE] Starting on http://${host}:${port}"
echo "[OMNITRACE] Stop with Ctrl+C. This local launcher binds to loopback by default."
exec uvicorn backend.app.main:app --host "$host" --port "$port"
