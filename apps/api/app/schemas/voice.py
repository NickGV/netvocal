from pydantic import BaseModel, Field


class VoiceTurnRequest(BaseModel):
    utterance: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None


class VoiceTurnResponse(BaseModel):
    assistant_text: str
    session_id: str


class HistoryEntry(BaseModel):
    role: str
    text: str
    timestamp: str


class HistoryResponse(BaseModel):
    session_id: str
    turns: list[HistoryEntry]
