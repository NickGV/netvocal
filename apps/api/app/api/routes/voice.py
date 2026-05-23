from fastapi import APIRouter, Depends

from app.core.deps import get_llm_service, get_stt_service, get_tts_service
from app.schemas.voice import VoiceTurnRequest, VoiceTurnResponse, ConversationItem
from app.services.llm.base import LLMService
from app.services.stt.base import STTService
from app.services.tts.base import TTSService

import uuid
from datetime import datetime
from typing import List

router = APIRouter()

# TEMPORARY: in-memory conversation history (session global)
conversation_history: List[ConversationItem] = []

@router.get("/history", response_model=List[ConversationItem])
def get_history():
    return conversation_history

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

    now = datetime.utcnow().isoformat() + "Z"
    # Save user turn
    user_item = ConversationItem(
        id=str(uuid.uuid4()),
        role="user",
        text=payload.utterance,
        timestamp=now,
    )

    # Save assistant turn
    assistant_item = ConversationItem(
        id=str(uuid.uuid4()),
        role="assistant",
        text=assistant_text,
        timestamp=now,
    )
    conversation_history.append(user_item)
    conversation_history.append(assistant_item)
    return VoiceTurnResponse(assistant_text=assistant_text)
