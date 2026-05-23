"""Unit tests for STT, LLM, and TTS services."""

import pytest

from app.services.llm.mock import MockLLMService
from app.services.llm.openai import OpenAILLMService
from app.services.stt.mock import MockSTTService
from app.services.stt.openai import OpenAIWhisperSTTService
from app.services.tts.mock import MockTTSService
from app.services.tts.openai import OpenAITTSService


# STT Service Tests


class TestMockSTTService:
    """Test mock STT service."""

    @pytest.mark.asyncio
    async def test_transcribe_returns_string(self) -> None:
        service = MockSTTService()
        result = await service.transcribe(b"audio_data", filename="test.wav")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_transcribe_handles_empty_audio(self) -> None:
        service = MockSTTService()
        result = await service.transcribe(b"", filename="empty.wav")
        assert isinstance(result, str)


class TestOpenAIWhisperSTTService:
    """Test OpenAI Whisper STT service."""

    def test_init_with_api_key(self) -> None:
        service = OpenAIWhisperSTTService(api_key="test-key")
        assert service._client is not None
        assert service._model == "whisper-1"

    def test_init_with_custom_model(self) -> None:
        service = OpenAIWhisperSTTService(api_key="test-key", model="custom-model")
        assert service._model == "custom-model"


# LLM Service Tests


class TestMockLLMService:
    """Test mock LLM service."""

    @pytest.mark.asyncio
    async def test_generate_reply_returns_string(self) -> None:
        service = MockLLMService()
        result = await service.generate_reply("Hello")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_generate_reply_with_history(self) -> None:
        service = MockLLMService()
        history = [
            {"role": "user", "text": "Hi", "timestamp": "2026-05-23T00:00:00"},
            {"role": "assistant", "text": "Hello", "timestamp": "2026-05-23T00:00:01"},
        ]
        result = await service.generate_reply("How are you?", conversation_history=history)
        assert isinstance(result, str)

    @pytest.mark.asyncio
    async def test_generate_reply_with_empty_text(self) -> None:
        service = MockLLMService()
        result = await service.generate_reply("")
        assert isinstance(result, str)


class TestOpenAILLMService:
    """Test OpenAI LLM service."""

    def test_init_with_api_key(self) -> None:
        service = OpenAILLMService(api_key="test-key")
        assert service._client is not None
        assert service._model == "gpt-4o-mini"

    def test_init_with_custom_model(self) -> None:
        service = OpenAILLMService(api_key="test-key", model="gpt-4")
        assert service._model == "gpt-4"

    def test_build_messages_system_prompt(self) -> None:
        service = OpenAILLMService(api_key="test-key")
        messages = service._build_messages("Hello", None)
        assert len(messages) == 2
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Hello"

    def test_build_messages_with_history(self) -> None:
        service = OpenAILLMService(api_key="test-key")
        history = [
            {"role": "user", "text": "Hi", "timestamp": "2026-05-23T00:00:00"},
            {"role": "assistant", "text": "Hello", "timestamp": "2026-05-23T00:00:01"},
        ]
        messages = service._build_messages("How are you?", history)
        assert len(messages) == 4  # system + 2 history items + user query
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Hi"
        assert messages[2]["role"] == "assistant"
        assert messages[2]["content"] == "Hello"
        assert messages[3]["role"] == "user"
        assert messages[3]["content"] == "How are you?"


# TTS Service Tests


class TestMockTTSService:
    """Test mock TTS service."""

    @pytest.mark.asyncio
    async def test_synthesize_returns_bytes(self) -> None:
        service = MockTTSService()
        result = await service.synthesize("Hello, world!")
        assert isinstance(result, bytes)

    @pytest.mark.asyncio
    async def test_synthesize_with_empty_text(self) -> None:
        service = MockTTSService()
        result = await service.synthesize("")
        assert isinstance(result, bytes)


class TestOpenAITTSService:
    """Test OpenAI TTS service."""

    def test_init_with_api_key(self) -> None:
        service = OpenAITTSService(api_key="test-key")
        assert service._client is not None
        assert service._model == "tts-1"
        assert service._voice == "alloy"

    def test_init_with_custom_model_and_voice(self) -> None:
        service = OpenAITTSService(
            api_key="test-key",
            model="tts-1-hd",
            voice="nova"
        )
        assert service._model == "tts-1-hd"
        assert service._voice == "nova"

    @pytest.mark.parametrize("voice", ["alloy", "echo", "fused", "onyx", "nova", "shimmer"])
    def test_init_with_all_voices(self, voice: str) -> None:
        service = OpenAITTSService(api_key="test-key", voice=voice)
        assert service._voice == voice
