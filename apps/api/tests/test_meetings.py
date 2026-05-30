from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.main import create_app

app = create_app()
client = TestClient(app)

def test_create_meeting():
    now = datetime.now() + timedelta(hours=1)
    resp = client.post("/meetings/", json={
        "title": "Standup",
        "starts_at": now.isoformat(),
        "ends_at": (now + timedelta(hours=1)).isoformat()
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "id" in data
    assert data["title"] == "Standup"

def test_create_meeting_past_date():
    past = datetime.now() - timedelta(days=1)
    resp = client.post("/meetings/", json={
        "title": "Vieja",
        "starts_at": past.isoformat(),
        "ends_at": (past + timedelta(hours=1)).isoformat()
    })
    assert resp.status_code == 200

def test_get_meetings():
    now = datetime.now() + timedelta(hours=2)
    client.post("/meetings/", json={
        "title": "Revisión",
        "starts_at": now.isoformat(),
        "ends_at": (now + timedelta(hours=1)).isoformat()
    })
    resp = client.get("/meetings/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_delete_meeting():
    now = datetime.now() + timedelta(hours=5)
    r = client.post("/meetings/", json={
        "title": "Para eliminar",
        "starts_at": now.isoformat(),
        "ends_at": (now + timedelta(hours=1)).isoformat()
    })
    meeting_id = r.json()["id"]
    resp = client.delete(f"/meetings/{meeting_id}")
    assert resp.status_code == 204
    resp2 = client.delete(f"/meetings/{meeting_id}")
    assert resp2.status_code == 404
