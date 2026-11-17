from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.cases import initialize

initialize()

client = TestClient(app)


def _create_case(title: str) -> int:
    response = client.post("/api/cases", json={"title": title, "notes": ""})
    assert response.status_code == 201
    return response.json()["id"]


def test_indicator_is_classified_and_listed():
    response = client.post("/api/indicators", json={"value": "8.8.8.8", "note": "Resolver"})
    assert response.status_code == 201
    body = response.json()
    assert body["indicator_type"] == "ip"
    assert body["duplicate"] is False
    assert body["note"] == "Resolver"

    listed = client.get("/api/indicators?indicator_type=ip")
    assert listed.status_code == 200
    data = listed.json()
    assert any(item["value"] == "8.8.8.8" for item in data["indicators"])
    assert data["counts_by_type"].get("ip", 0) >= 1


def test_indicator_types_are_detected():
    samples = {
        "example.org": "domain",
        "https://example.org/path": "url",
        "analyst@example.org": "email",
        "d41d8cd98f00b204e9800998ecf8427e": "hash",
    }
    for value, expected in samples.items():
        response = client.post("/api/indicators", json={"value": value})
        assert response.status_code == 201, value
        assert response.json()["indicator_type"] == expected


def test_indicator_duplicate_is_reported_per_case():
    case_id = _create_case("Duplicate case")
    first = client.post("/api/indicators", json={"value": "dupe.example", "case_id": case_id})
    assert first.status_code == 201
    assert first.json()["duplicate"] is False

    second = client.post("/api/indicators", json={"value": "DUPE.example", "case_id": case_id})
    assert second.status_code == 201
    assert second.json()["duplicate"] is True
    assert second.json()["id"] == first.json()["id"]


def test_indicator_validation_and_case_link():
    assert client.post("/api/indicators", json={"value": "   "}).status_code == 422
    assert client.post("/api/indicators", json={"value": "not a real indicator!!!"}).status_code == 422
    assert client.post("/api/indicators", json={"value": "1.1.1.1", "case_id": 999999}).status_code == 422

    case_id = _create_case("Linked case")
    created = client.post("/api/indicators", json={"value": "1.1.1.1", "case_id": case_id})
    assert created.status_code == 201
    assert created.json()["case_id"] == case_id
    assert created.json()["case_title"] == "Linked case"

    filtered = client.get(f"/api/indicators?case_id={case_id}")
    assert filtered.status_code == 200
    assert [item["value"] for item in filtered.json()["indicators"]] == ["1.1.1.1"]


def test_indicator_delete_and_missing_delete():
    created = client.post("/api/indicators", json={"value": "9.9.9.9"})
    assert created.status_code == 201
    indicator_id = created.json()["id"]

    deleted = client.delete(f"/api/indicators/{indicator_id}")
    assert deleted.status_code == 204
    assert client.delete(f"/api/indicators/{indicator_id}").status_code == 404


def test_indicator_query_limits_are_validated():
    assert client.get("/api/indicators?limit=0").status_code == 422
    assert client.get("/api/indicators?limit=501").status_code == 422
    assert client.get("/api/indicators?case_id=0").status_code == 422
