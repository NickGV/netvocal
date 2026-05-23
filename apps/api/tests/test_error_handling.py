"""Error handling and resilience tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


class TestInputValidation:
    """Test input validation and error handling."""

    def test_voice_turn_empty_utterance_rejected(self) -> None:
        """Test that empty utterance is rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={"utterance": ""})
        assert res.status_code == 422

    def test_voice_turn_missing_utterance_rejected(self) -> None:
        """Test that missing utterance is rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={})
        assert res.status_code == 422

    def test_voice_turn_invalid_json_rejected(self) -> None:
        """Test that invalid JSON is rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", data="not json")
        assert res.status_code in [400, 422]

    def test_voice_history_missing_session_id_rejected(self) -> None:
        """Test that missing session_id is rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.get("/voice/history")
        assert res.status_code == 422

    def test_voice_history_empty_session_id_rejected(self) -> None:
        """Test that empty session_id is rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.get("/voice/history?session_id=")
        assert res.status_code == 422

    def test_task_creation_empty_title_rejected(self) -> None:
        """Test that tasks with empty title are rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/tasks", json={"title": ""})
        assert res.status_code == 422

    def test_task_creation_missing_title_rejected(self) -> None:
        """Test that tasks without title are rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/tasks", json={})
        assert res.status_code == 422

    def test_meeting_creation_empty_title_rejected(self) -> None:
        """Test that meetings with empty title are rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post(
            "/meetings",
            json={
                "title": "",
                "starts_at": "2026-05-24T10:00:00",
                "ends_at": "2026-05-24T10:30:00"
            }
        )
        assert res.status_code == 422

    def test_meeting_creation_missing_dates_rejected(self) -> None:
        """Test that meetings without dates are rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/meetings", json={"title": "Test"})
        assert res.status_code == 422

    def test_meeting_creation_missing_title_rejected(self) -> None:
        """Test that meetings without title are rejected."""
        app = create_app()
        client = TestClient(app)

        res = client.post(
            "/meetings",
            json={
                "starts_at": "2026-05-24T10:00:00",
                "ends_at": "2026-05-24T10:30:00"
            }
        )
        assert res.status_code == 422


class TestBoundaryConditions:
    """Test boundary conditions and edge cases."""

    def test_special_characters_in_utterance(self) -> None:
        """Test handling of special characters."""
        app = create_app()
        client = TestClient(app)

        special_text = "Hello!@#$%^&*()_+-=[]{}|;':\",./<>?"
        res = client.post("/voice/turn", json={"utterance": special_text})
        assert res.status_code == 200
        assert res.json()["assistant_text"]

    def test_unicode_in_utterance(self) -> None:
        """Test handling of unicode characters."""
        app = create_app()
        client = TestClient(app)

        unicode_text = "¡Hola! Cómo estás? 你好 مرحبا"
        res = client.post("/voice/turn", json={"utterance": unicode_text})
        assert res.status_code == 200

    def test_numeric_only_utterance(self) -> None:
        """Test handling of numeric-only utterance."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={"utterance": "12345"})
        assert res.status_code == 200
        assert res.json()["assistant_text"]

    def test_very_long_task_title(self) -> None:
        """Test handling of very long task title (max 200 chars)."""
        app = create_app()
        client = TestClient(app)

        long_title = "a" * 200
        res = client.post("/tasks", json={"title": long_title})
        assert res.status_code == 200

    def test_task_title_too_long_rejected(self) -> None:
        """Test that task title exceeding max length is rejected."""
        app = create_app()
        client = TestClient(app)

        too_long_title = "a" * 201
        res = client.post("/tasks", json={"title": too_long_title})
        assert res.status_code == 422


class TestNotFoundErrors:
    """Test not found and missing resource handling."""

    def test_voice_history_unknown_session_returns_empty(self) -> None:
        """Test that unknown session returns empty history."""
        app = create_app()
        client = TestClient(app)

        res = client.get("/voice/history?session_id=nonexistent-session-123")
        assert res.status_code == 200
        data = res.json()
        assert data["turns"] == []

    def test_invalid_route_returns_404(self) -> None:
        """Test that invalid route returns 404."""
        app = create_app()
        client = TestClient(app)

        res = client.get("/nonexistent-endpoint")
        assert res.status_code == 404


class TestResponseConsistency:
    """Test response structure consistency."""

    def test_voice_turn_response_structure(self) -> None:
        """Test that voice turn response has required fields."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={"utterance": "Test"})
        assert res.status_code == 200
        
        data = res.json()
        required_fields = ["session_id", "assistant_text"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_voice_history_response_structure(self) -> None:
        """Test that voice history response has required fields."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={"utterance": "Test"})
        session_id = res.json()["session_id"]

        hist_res = client.get(f"/voice/history?session_id={session_id}")
        assert hist_res.status_code == 200
        
        data = hist_res.json()
        required_fields = ["session_id", "turns"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        # Each turn should have required fields
        for turn in data["turns"]:
            assert "role" in turn
            assert "text" in turn
            assert "timestamp" in turn

    def test_task_response_structure(self) -> None:
        """Test that task response has required fields."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/tasks", json={"title": "Test task"})
        assert res.status_code == 200
        
        data = res.json()
        required_fields = ["id", "title"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_meeting_response_structure(self) -> None:
        """Test that meeting response has required fields."""
        app = create_app()
        client = TestClient(app)

        res = client.post(
            "/meetings",
            json={
                "title": "Test meeting",
                "starts_at": "2026-05-24T10:00:00",
                "ends_at": "2026-05-24T10:30:00"
            }
        )
        assert res.status_code == 200
        
        data = res.json()
        required_fields = ["id", "title", "starts_at", "ends_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"


class TestErrorResponseStructure:
    """Test error response structure."""

    def test_validation_error_response_structure(self) -> None:
        """Test that validation errors have proper structure."""
        app = create_app()
        client = TestClient(app)

        res = client.post("/voice/turn", json={})
        assert res.status_code == 422
        
        # FastAPI returns detail field for validation errors
        data = res.json()
        assert "detail" in data
