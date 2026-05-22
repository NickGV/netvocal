"""Tests for the /voice/turn and /voice/history endpoints."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_voice_turn_returns_assistant_text() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={"utterance": "Hello"})

    assert res.status_code == 200
    data = res.json()
    assert "assistant_text" in data
    assert isinstance(data["assistant_text"], str)
    assert len(data["assistant_text"]) > 0


def test_voice_turn_rejects_empty_utterance() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={"utterance": ""})

    assert res.status_code == 422


def test_voice_turn_rejects_missing_utterance() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={})

    assert res.status_code == 422


def test_voice_turn_creates_session_id() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={"utterance": "Hello"})

    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0


def test_voice_turn_reuses_session_id() -> None:
    app = create_app()
    client = TestClient(app)

    sid = "reuse-test-session"
    res1 = client.post("/voice/turn", json={"utterance": "First", "session_id": sid})
    assert res1.status_code == 200
    assert res1.json()["session_id"] == sid

    res2 = client.post("/voice/turn", json={"utterance": "Second", "session_id": sid})
    assert res2.status_code == 200
    assert res2.json()["session_id"] == sid


def test_voice_history_returns_turns() -> None:
    app = create_app()
    client = TestClient(app)

    sid = "history-test-001"
    client.post("/voice/turn", json={"utterance": "Hello", "session_id": sid})
    client.post("/voice/turn", json={"utterance": "How are you?", "session_id": sid})

    res = client.get(f"/voice/history?session_id={sid}")
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"] == sid
    assert len(data["turns"]) == 4
    assert data["turns"][0]["role"] == "user"
    assert data["turns"][0]["text"] == "Hello"
    assert data["turns"][1]["role"] == "assistant"
    assert data["turns"][3]["role"] == "assistant"
    assert data["turns"][3]["text"] == "(mock) You said: How are you?"


def test_voice_history_empty_for_unknown_session() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.get("/voice/history?session_id=does-not-exist")

    assert res.status_code == 200
    assert res.json() == {"session_id": "does-not-exist", "turns": []}


def test_voice_history_rejects_missing_session_id() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.get("/voice/history")

    assert res.status_code == 422


def test_voice_turn_audio_returns_assistant_text() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn/audio", files={"audio": ("test.wav", b"fake audio data", "audio/wav")})

    assert res.status_code == 200
    data = res.json()
    assert "assistant_text" in data
    assert isinstance(data["assistant_text"], str)
    assert len(data["assistant_text"]) > 0


def test_voice_turn_audio_creates_session_id() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn/audio", files={"audio": ("test.wav", b"fake audio data", "audio/wav")})

    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0


def test_voice_turn_audio_reuses_session_id() -> None:
    app = create_app()
    client = TestClient(app)

    sid = "audio-reuse-test"
    res = client.post(
        "/voice/turn/audio",
        files={"audio": ("test.wav", b"fake audio data", "audio/wav")},
        data={"session_id": sid},
    )

    assert res.status_code == 200
    assert res.json()["session_id"] == sid


def test_voice_turn_audio_rejects_missing_audio() -> None:
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn/audio")

    assert res.status_code == 422
