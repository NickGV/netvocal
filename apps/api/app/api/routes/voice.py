from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from app.core.deps import get_llm_service, get_stt_service, get_tts_service
from app.db.memory import ConversationStore, get_conversation_store
from app.schemas.voice import (
    HistoryEntry,
    HistoryResponse,
    VoiceTurnRequest,
    VoiceTurnResponse,
)
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
    store: ConversationStore = Depends(get_conversation_store),
) -> VoiceTurnResponse:
    _ = stt
    _ = tts

    session_id = payload.session_id or store.create_session()
    history = store.get_history(session_id)
    assistant_text = await llm.generate_reply(payload.utterance, conversation_history=history)
    store.add_turn(session_id, payload.utterance, assistant_text)
    return VoiceTurnResponse(assistant_text=assistant_text, session_id=session_id)


@router.post("/turn/audio", response_model=VoiceTurnResponse)
async def voice_turn_audio(
    audio: UploadFile = File(...),
    session_id: str | None = Form(None),
    stt: STTService = Depends(get_stt_service),
    llm: LLMService = Depends(get_llm_service),
    store: ConversationStore = Depends(get_conversation_store),
) -> VoiceTurnResponse:
    audio_bytes = await audio.read()
    utterance = await stt.transcribe(audio_bytes, filename=audio.filename or "audio.wav")

    session_id = session_id or store.create_session()
    history = store.get_history(session_id)
    assistant_text = await llm.generate_reply(utterance, conversation_history=history)
    store.add_turn(session_id, utterance, assistant_text)
    return VoiceTurnResponse(assistant_text=assistant_text, session_id=session_id)


@router.get("/history", response_model=HistoryResponse)
async def voice_history(
    session_id: str = Query(..., min_length=1),
    store: ConversationStore = Depends(get_conversation_store),
) -> HistoryResponse:
    turns = store.get_history(session_id)
    return HistoryResponse(
        session_id=session_id,
        turns=[HistoryEntry(**t) for t in turns],
    )
