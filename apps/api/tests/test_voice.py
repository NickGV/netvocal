"""Tests for the /voice/turn endpoint."""

from fastapi.testclient import TestClient

from app.main import create_app


def test_voice_turn_returns_assistant_text() -> None:
    """The endpoint should return a response with assistant_text."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={"utterance": "Hello"})

    assert res.status_code == 200
    data = res.json()
    assert "assistant_text" in data
    assert isinstance(data["assistant_text"], str)
    assert len(data["assistant_text"]) > 0


def test_voice_turn_rejects_empty_utterance() -> None:
    """Empty or too-short utterances should be rejected with 422."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={"utterance": ""})

    assert res.status_code == 422


def test_voice_turn_rejects_missing_utterance() -> None:
    """Missing utterance field should return 422."""
    app = create_app()
    client = TestClient(app)

    res = client.post("/voice/turn", json={})

    assert res.status_code == 422
