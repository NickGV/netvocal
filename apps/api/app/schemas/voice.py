from pydantic import BaseModel, Field


class VoiceTurnRequest(BaseModel):
    utterance: str = Field(min_length=1, max_length=4000)


from typing import Literal

class ConversationItem(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    text: str
    timestamp: str  # ISO 8601

class VoiceTurnResponse(BaseModel):
    assistant_text: str
