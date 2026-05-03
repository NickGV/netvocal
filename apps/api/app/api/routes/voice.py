from fastapi import APIRouter, Depends

from app.core.deps import get_llm_service, get_stt_service, get_tts_service
from app.schemas.voice import VoiceTurnRequest, VoiceTurnResponse
from app.services.llm.base import LLMService
from app.services.stt.base import STTService
from app.services.tts.base import TTSService

router = APIRouter()


@router.post("/turn", response_model=VoiceTurnResponse)
async def voice_turn(
    payload: VoiceTurnRequest,
    stt: STTService = Depends(get_stt_service),
    llm: LLMService = Depends(get_llm_service),
    tts: TTSService = Depends(get_tts_service),
) -> VoiceTurnResponse:
    """Mocked pipeline endpoint.

    For now we accept a text "utterance" and return a mocked assistant response.
    Audio transport/streaming will be introduced later.
    """

    _ = stt  # reserved for future audio-based transcribe()
    _ = tts  # reserved for future synthesize()

    assistant_text = await llm.generate_reply(payload.utterance)
    return VoiceTurnResponse(assistant_text=assistant_text)
