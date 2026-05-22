"""Tests for the /tasks endpoints."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_list_tasks_returns_list() -> None:
    """GET /tasks should return a list (empty for now)."""
    app = create_app()
    client = TestClient(app)

    res = client.get("/tasks/")

    assert res.status_code == 200
    assert res.json() == []


def test_create_task_returns_task() -> None:
    """POST /tasks should return a task-like object."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/tasks/", json={"title": "Buy milk"})

    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Buy milk"
    assert "id" in data


def test_create_task_with_due_date() -> None:
    """Tasks can include an optional due_at date."""
    app = create_app()
    client = TestClient(app)

    res = client.post(
        "/tasks/",
        json={
            "title": "Submit report",
            "due_at": "2026-06-01T10:00:00",
        },
    )

    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Submit report"
    assert "due_at" in data


def test_create_task_rejects_empty_title() -> None:
    """Empty title should return 422."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/tasks/", json={"title": ""})

    assert res.status_code == 422
