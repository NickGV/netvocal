from pydantic import BaseModel, Field


class VoiceTurnRequest(BaseModel):
    utterance: str = Field(min_length=1, max_length=4000)


class VoiceTurnResponse(BaseModel):
    assistant_text: str
