"""Integration tests for voice pipeline and endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


class TestVoicePipelineIntegration:
    """Integration tests for the complete voice pipeline."""

    def test_voice_pipeline_end_to_end_text(self) -> None:
        """Test complete voice pipeline with text input."""
        app = create_app()
        client = TestClient(app)

        # Create a session and send a voice turn
        res = client.post(
            "/voice/turn",
            json={"utterance": "Hello, how are you?"}
        )

        assert res.status_code == 200
        data = res.json()
        
        # Verify response structure
        assert "session_id" in data
        assert "assistant_text" in data
        session_id = data["session_id"]
        
        # Verify we can retrieve history
        history_res = client.get(f"/voice/history?session_id={session_id}")
        assert history_res.status_code == 200
        history_data = history_res.json()
        
        assert history_data["session_id"] == session_id
        assert len(history_data["turns"]) == 2
        assert history_data["turns"][0]["role"] == "user"
        assert history_data["turns"][0]["text"] == "Hello, how are you?"
        assert history_data["turns"][1]["role"] == "assistant"

    def test_voice_pipeline_multiple_turns(self) -> None:
        """Test multiple turns in same session."""
        app = create_app()
        client = TestClient(app)

        # First turn
        res1 = client.post(
            "/voice/turn",
            json={"utterance": "What is 2+2?"}
        )
        assert res1.status_code == 200
        session_id = res1.json()["session_id"]

        # Second turn
        res2 = client.post(
            "/voice/turn",
            json={"utterance": "What about 3+3?", "session_id": session_id}
        )
        assert res2.status_code == 200

        # Verify full history
        history_res = client.get(f"/voice/history?session_id={session_id}")
        assert history_res.status_code == 200
        history_data = history_res.json()
        
        # Should have 4 turns (2 exchanges × 2 roles)
        assert len(history_data["turns"]) == 4
        assert history_data["turns"][0]["text"] == "What is 2+2?"
        assert history_data["turns"][2]["text"] == "What about 3+3?"

    def test_voice_and_tasks_integration(self) -> None:
        """Test integration between voice and tasks endpoints."""
        app = create_app()
        client = TestClient(app)

        # Create a task
        task_res = client.post(
            "/tasks",
            json={"title": "Buy milk", "description": "From the grocery store"}
        )
        assert task_res.status_code == 200
        task_data = task_res.json()
        assert task_data["title"] == "Buy milk"

        # Voice interaction
        voice_res = client.post(
            "/voice/turn",
            json={"utterance": "What tasks do I have?"}
        )
        assert voice_res.status_code == 200

    def test_voice_and_meetings_integration(self) -> None:
        """Test integration between voice and meetings endpoints."""
        app = create_app()
        client = TestClient(app)

        # Create a meeting
        meeting_res = client.post(
            "/meetings",
            json={
                "title": "Team standup",
                "starts_at": "2026-05-24T09:00:00",
                "ends_at": "2026-05-24T09:30:00"
            }
        )
        assert meeting_res.status_code == 200
        meeting_data = meeting_res.json()
        assert meeting_data["title"] == "Team standup"

        # Voice interaction
        voice_res = client.post(
            "/voice/turn",
            json={"utterance": "What meetings do I have today?"}
        )
        assert voice_res.status_code == 200


class TestEndpointIntegration:
    """Integration tests for endpoint interactions."""

    def test_voice_endpoint_returns_session_id(self) -> None:
        """Test that voice endpoint returns session ID."""
        app = create_app()
        client = TestClient(app)

        res = client.post(
            "/voice/turn",
            json={"utterance": "Hello"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "session_id" in data
        assert "assistant_text" in data

    def test_health_check_integration(self) -> None:
        """Test health check endpoint."""
        app = create_app()
        client = TestClient(app)

        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"


class TestVoiceHistoryPersistence:
    """Test conversation history persistence."""

    def test_history_persists_across_requests(self) -> None:
        """Test that history persists across multiple requests."""
        app = create_app()
        client = TestClient(app)

        session_id = "test-session-persistence"

        # First turn
        client.post(
            "/voice/turn",
            json={"utterance": "First message", "session_id": session_id}
        )

        # Check history
        hist1 = client.get(f"/voice/history?session_id={session_id}").json()
        assert len(hist1["turns"]) == 2

        # Second turn
        client.post(
            "/voice/turn",
            json={"utterance": "Second message", "session_id": session_id}
        )

        # Check history again
        hist2 = client.get(f"/voice/history?session_id={session_id}").json()
        assert len(hist2["turns"]) == 4
        
        # Verify both messages are present
        messages = [t["text"] for t in hist2["turns"]]
        assert "First message" in messages
        assert "Second message" in messages

    def test_different_sessions_isolated(self) -> None:
        """Test that different sessions are isolated."""
        app = create_app()
        client = TestClient(app)

        # Session 1
        res1 = client.post(
            "/voice/turn",
            json={"utterance": "Session 1 message"}
        )
        session_id_1 = res1.json()["session_id"]

        # Session 2
        res2 = client.post(
            "/voice/turn",
            json={"utterance": "Session 2 message"}
        )
        session_id_2 = res2.json()["session_id"]

        # Get histories
        hist1 = client.get(f"/voice/history?session_id={session_id_1}").json()
        hist2 = client.get(f"/voice/history?session_id={session_id_2}").json()

        # Verify isolation
        messages_1 = [t["text"] for t in hist1["turns"]]
        messages_2 = [t["text"] for t in hist2["turns"]]

        assert "Session 1 message" in messages_1
        assert "Session 1 message" not in messages_2
        assert "Session 2 message" in messages_2
        assert "Session 2 message" not in messages_1
