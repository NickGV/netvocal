"""Tests for the /meetings endpoints."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_list_meetings_returns_list() -> None:
    """GET /meetings should return a list (empty for now)."""
    app = create_app()
    client = TestClient(app)

    res = client.get("/meetings/")

    assert res.status_code == 200
    assert res.json() == []


def test_create_meeting_returns_meeting() -> None:
    """POST /meetings should return a meeting-like object."""
    app = create_app()
    client = TestClient(app)

    res = client.post(
        "/meetings/",
        json={
            "title": "Sprint review",
            "starts_at": "2026-05-22T10:00:00",
            "ends_at": "2026-05-22T11:00:00",
        },
    )

    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Sprint review"
    assert "id" in data
    assert "starts_at" in data
    assert "ends_at" in data


def test_create_meeting_rejects_empty_title() -> None:
    """Empty title should return 422."""
    app = create_app()
    client = TestClient(app)

    res = client.post(
        "/meetings/",
        json={
            "title": "",
            "starts_at": "2026-05-22T10:00:00",
            "ends_at": "2026-05-22T11:00:00",
        },
    )

    assert res.status_code == 422


def test_create_meeting_rejects_missing_dates() -> None:
    """Missing required date fields should return 422."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/meetings/", json={"title": "Standup"})

    assert res.status_code == 422
