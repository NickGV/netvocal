import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from apps.api.routers import meetings as meetings_router

def create_app():
    app = FastAPI()
    app.include_router(meetings_router.router)
    return app

app = create_app()
client = TestClient(app)

def test_create_meeting():
    import datetime
    now = datetime.datetime.now() + datetime.timedelta(hours=1)
    resp = client.post("/meetings/", json={
        "topic": "Standup",
        "participants": ["elber", "ana"],
        "scheduled_for": now.isoformat(),
        "description": "Standup diario"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert data["topic"] == "Standup"
    assert len(data["participants"]) == 2

def test_create_meeting_with_no_participants():
    import datetime
    now = datetime.datetime.now() + datetime.timedelta(hours=1)
    resp = client.post("/meetings/", json={
        "topic": "1:1",
        "scheduled_for": now.isoformat(),
        "participants": []
    })
    assert resp.status_code == 422

def test_create_meeting_past_date():
    import datetime
    past = datetime.datetime.now() - datetime.timedelta(days=1)
    resp = client.post("/meetings/", json={
        "topic": "Vieja",
        "participants": ["a"],
        "scheduled_for": past.isoformat()
    })
    assert resp.status_code in (400, 422)

def test_get_meetings():
    import datetime
    now = datetime.datetime.now() + datetime.timedelta(hours=2)
    client.post("/meetings/", json={
        "topic": "Revisión",
        "participants": ["oscar"],
        "scheduled_for": now.isoformat()
    })
    resp = client.get("/meetings/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_delete_meeting():
    import datetime
    now = datetime.datetime.now() + datetime.timedelta(hours=5)
    r = client.post("/meetings/", json={
        "topic": "Para eliminar",
        "participants": ["borra"],
        "scheduled_for": now.isoformat()
    })
    meeting_id = r.json()["id"]
    resp = client.delete(f"/meetings/{meeting_id}")
    assert resp.status_code == 204
    resp2 = client.delete(f"/meetings/{meeting_id}")
    assert resp2.status_code == 404
