from app.core.settings import Settings
from app.services.llm.base import LLMService
from app.services.llm.mock import MockLLMService
from app.services.llm.openai import OpenAILLMService
from app.services.stt.base import STTService
from app.services.stt.mock import MockSTTService
from app.services.stt.openai import OpenAIWhisperSTTService
from app.services.tts.base import TTSService
from app.services.tts.mock import MockTTSService
from app.services.tts.openai import OpenAITTSService


def get_stt_service() -> STTService:
    settings = Settings()
    if settings.stt_provider == "openai":
        return OpenAIWhisperSTTService(
            api_key=settings.openai_api_key,
            model=settings.whisper_model,
        )
    return MockSTTService()


def get_llm_service() -> LLMService:
    settings = Settings()
    if settings.llm_provider == "openai":
        return OpenAILLMService(
            api_key=settings.openai_api_key,
            model=settings.llm_model,
        )
    return MockLLMService()


def get_tts_service() -> TTSService:
    settings = Settings()
    if settings.tts_provider == "openai":
        return OpenAITTSService(
            api_key=settings.openai_api_key,
            model=settings.tts_model,
            voice=settings.tts_voice,
        )
    return MockTTSService()
