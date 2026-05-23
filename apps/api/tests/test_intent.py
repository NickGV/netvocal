import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from apps.api.routers import intent as intent_router

def create_app():
    app = FastAPI()
    app.include_router(intent_router.router)
    return app

app = create_app()
client = TestClient(app)

def test_parse_create_task():
    resp = client.post("/intent/parse", json={"query": "Crea una tarea para mañana llamada estudiar matemáticas"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"].startswith("create_task")
    assert "result" in js and js["result"] is not None
    assert "task" in js["result"]

def test_parse_schedule_meeting():
    resp = client.post("/intent/parse", json={"query": "Agenda reunión el viernes a las 3pm"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"].startswith("schedule_meeting")
    assert "result" in js and js["result"] is not None
    assert "meeting" in js["result"]

def test_parse_general_query_tareas():
    client.post("/intent/parse", json={"query": "Crea una tarea para mañana llamada repasar LLM"})
    resp = client.post("/intent/parse", json={"query": "¿Qué tareas tengo pendientes?"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"].startswith("general_query")
    assert "tasks" in js["result"]

def test_parse_general_query_meetings():
    client.post("/intent/parse", json={"query": "Agenda reunión el viernes a las 3pm"})
    resp = client.post("/intent/parse", json={"query": "¿Qué reuniones tengo?"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"].startswith("general_query")
    assert "meetings" in js["result"]

def test_parse_unknown_intent():
    resp = client.post("/intent/parse", json={"query": "esto no tiene sentido especial"})
    assert resp.status_code == 200
    js = resp.json()
    assert js["intent"] == "unknown"
    assert js["result"] is None
