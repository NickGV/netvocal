from app.services.llm.base import LLMService
from app.services.llm.mock import MockLLMService
from app.services.stt.base import STTService
from app.services.stt.mock import MockSTTService
from app.services.tts.base import TTSService
from app.services.tts.mock import MockTTSService


def get_stt_service() -> STTService:
    return MockSTTService()


def get_llm_service() -> LLMService:
    return MockLLMService()


def get_tts_service() -> TTSService:
    return MockTTSService()
