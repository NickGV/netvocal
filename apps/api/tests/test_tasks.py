import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from apps.api.routers import tasks as tasks_router

def create_app():
    app = FastAPI()
    app.include_router(tasks_router.router)
    return app

app = create_app()
client = TestClient(app)

def test_create_task():
    resp = client.post("/tasks/", json={"title": "Estudiar AI", "description": "Repasar transformers", "status": "pending"})
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert data["title"] == "Estudiar AI"
    assert data["status"] == "pending"

def test_create_task_with_past_due_date():
    from datetime import datetime, timedelta
    past_date = (datetime.now() - timedelta(days=1)).isoformat()
    resp = client.post("/tasks/", json={"title": "Tarea pasada", "due_date": past_date})
    assert resp.status_code == 400

def test_get_tasks():
    client.post("/tasks/", json={"title": "Una tarea más"})
    resp = client.get("/tasks/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_delete_task():
    r = client.post("/tasks/", json={"title": "Para borrar"})
    task_id = r.json()["id"]
    resp = client.delete(f"/tasks/{task_id}")
    assert resp.status_code == 204
    resp2 = client.delete(f"/tasks/{task_id}")
    assert resp2.status_code == 404
