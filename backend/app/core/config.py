"""Environment-driven application configuration."""
import os
from pathlib import Path

APP_NAME = "OMNITRACE"
APP_VERSION = "0.5.1"

# PostgreSQL is the recommended deployment database. SQLite remains a convenient
# zero-configuration option for local development and tests.
_database_url = os.getenv("DATABASE_URL", "").strip()
if not _database_url:
    legacy_path = os.getenv("OMNITRACE_DB_PATH", "./omnitrace.db")
    if legacy_path == ":memory:":
        _database_url = "sqlite+pysqlite:///:memory:"
    else:
        _database_url = f"sqlite+pysqlite:///{Path(legacy_path).resolve()}"
DATABASE_URL = _database_url

DB_PATH = Path(os.getenv("OMNITRACE_DB_PATH", "./omnitrace.db"))
