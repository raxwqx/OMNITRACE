from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.identity.registry import find_candidates
from backend.app.services.cases import initialize

initialize()

client = TestClient(app)

def test_identity_candidates_are_marked_unverified():
    response = client.post("/api/identity/search", json={
        "username": "@example_user",
        "platforms": ["github", "reddit"],
    })
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "example_user"
    assert data["count"] == 2
    assert data["verified_accounts"] == 0
    assert all(item["status"] == "not_checked" for item in data["results"])
    assert data["results"][0]["url"] == "https://github.com/example_user"

def test_rejects_invalid_username():
    response = client.post("/api/identity/search", json={"username": "bad name!"})
    assert response.status_code == 422

def test_rejects_unknown_platform():
    response = client.post("/api/identity/search", json={
        "username": "tester", "platforms": ["unknown_social"]
    })
    assert response.status_code == 422

def test_registry_generates_many_platforms():
    results = find_candidates("tester")
    assert len(results) >= 15
    assert all("url" in item and "platform" in item for item in results)


def test_platform_catalog_has_categories():
    response = client.get("/api/identity/platforms")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 15
    assert all(item["category"] for item in data["platforms"])


def test_identity_search_is_recorded_in_history():
    response = client.post("/api/identity/search", json={
        "username": "history_test_user", "platforms": ["github", "reddit"]
    })
    assert response.status_code == 200
    history = client.get("/api/identity/history?limit=5")
    assert history.status_code == 200
    assert any(item["username"] == "history_test_user" for item in history.json()["searches"])


def test_identity_search_strips_multiple_leading_at_signs():
    response = client.post("/api/identity/search", json={"username": "@@tester", "platforms": ["github"]})
    assert response.status_code == 200
    assert response.json()["query"] == "tester"


def test_identity_search_rejects_empty_platform_list():
    response = client.post("/api/identity/search", json={"username": "tester", "platforms": []})
    assert response.status_code == 422


def test_identity_history_limit_is_bounded():
    assert client.get("/api/identity/history?limit=0").status_code == 422
    assert client.get("/api/identity/history?limit=51").status_code == 422


def test_platform_catalog_has_expected_keys():
    response = client.get("/api/identity/platforms")
    keys = {item["key"] for item in response.json()["platforms"]}
    assert {"github", "reddit", "instagram", "bluesky", "mastodon"}.issubset(keys)
