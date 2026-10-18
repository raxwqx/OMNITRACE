from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.cases import initialize

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_frontend_is_served():
    response = client.get("/")
    assert response.status_code == 200
    assert "OMNITRACE" in response.text

def test_case_create_and_list():
    initialize()
    created = client.post("/api/cases", json={
        "title": "Local test case", "notes": "Authorized lab exercise"
    })
    assert created.status_code == 201
    assert created.json()["title"] == "Local test case"
    listed = client.get("/api/cases")
    assert listed.status_code == 200
    assert any(item["title"] == "Local test case" for item in listed.json()["cases"])


def test_frontend_contains_matrix_intro_and_cache_busted_assets():
    response = client.get("/")
    assert response.status_code == 200
    html = response.text
    assert 'id="system-intro"' in html
    assert 'id="matrix-canvas"' in html
    assert 'app.js?v=0.5.1' in html
    assert 'styles.css?v=0.5.1' in html
    assert 'v0.5.1' in html


def test_static_assets_are_served():
    css = client.get("/static/styles.css?v=0.5.1")
    js = client.get("/static/app.js?v=0.5.1")
    assert css.status_code == 200 and ".system-intro" in css.text
    assert js.status_code == 200 and "matrix-canvas" in js.text
    assert "Always play on a fresh page load" in js.text
    assert "omnitrace-pro-intro-seen-v3" not in js.text
    assert "if(prefs.reduceMotion) $('#intro-skip')?.click()" not in js.text
    assert "Analyst Lab" in js.text


def test_health_reports_current_version():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["version"] == "0.5.1"


def test_analyst_lab_and_settings_are_present():
    response = client.get("/")
    assert response.status_code == 200
    html = response.text
    for feature_id in (
        "view-lab", "view-settings", "lab-ioc-run", "lab-defang-run",
        "lab-base64-run", "lab-url-run", "lab-sha-run", "lab-timestamp-run",
        "lab-cidr-run", "lab-source-run", "lab-rel-run", "lab-report-run",
        "theme-accent", "compact-mode", "disable-motion",
    ):
        assert feature_id in html

def test_case_rejects_blank_title():
    response = client.post("/api/cases", json={"title": "   ", "notes": "test"})
    assert response.status_code == 422


def test_case_rejects_overlong_title():
    response = client.post("/api/cases", json={"title": "x" * 121, "notes": ""})
    assert response.status_code == 422
