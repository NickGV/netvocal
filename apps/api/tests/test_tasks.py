from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.main import create_app

app = create_app()
client = TestClient(app)

def test_create_task():
    resp = client.post("/tasks/", json={"title": "Estudiar AI"})
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert data["title"] == "Estudiar AI"

def test_create_task_with_due_date():
    future_date = (datetime.now() + timedelta(days=1)).isoformat()
    resp = client.post("/tasks/", json={"title": "Tarea con fecha", "due_at": future_date})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Tarea con fecha"

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
