from fastapi.testclient import TestClient

from app.main import create_app

app = create_app()
client = TestClient(app)

def test_parse_create_task():
    resp = client.post("/intent/parse", json={"query": "Crea una tarea para mañana llamada estudiar matemáticas"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "create_task"
    assert "message" in js

def test_parse_schedule_meeting():
    resp = client.post("/intent/parse", json={"query": "Agenda reunión el viernes a las 3pm"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "schedule_meeting"
    assert "message" in js

def test_parse_list_tasks():
    resp = client.post("/intent/parse", json={"query": "¿Qué tareas tengo pendientes?"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "list_tasks"
    assert "message" in js

def test_parse_list_meetings():
    resp = client.post("/intent/parse", json={"query": "¿Qué reuniones tengo?"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "list_meetings"
    assert "message" in js

def test_parse_general_query():
    resp = client.post("/intent/parse", json={"query": "esto no tiene sentido especial"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "general"
