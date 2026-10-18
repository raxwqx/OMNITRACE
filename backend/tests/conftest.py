"""Isolate test data before application modules create the SQLAlchemy engine."""
import os
import tempfile
from pathlib import Path

_TEST_DIR = Path(tempfile.mkdtemp(prefix="omnitrace-tests-"))
os.environ["OMNITRACE_DB_PATH"] = str(_TEST_DIR / "test.db")
os.environ.pop("DATABASE_URL", None)
