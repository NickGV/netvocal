from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class MeetingBase(BaseModel):
    topic: str = Field(..., min_length=1, max_length=120)
    scheduled_for: datetime = Field(...)
    participants: List[str] = Field(..., min_items=1)
    description: Optional[str] = Field(None, max_length=500)

    @validator("scheduled_for", pre=True, always=True)
    def valid_datetime(cls, value):
        try:
            dt = value if isinstance(value, datetime) else datetime.fromisoformat(value)
            if dt < datetime.now():
                raise ValueError("No se puede agendar una reunión en el pasado")
            return dt
        except Exception:
            raise ValueError("scheduled_for debe ser formato ISO y fecha futura")

    @validator("participants")
    def at_least_one_participant(cls, value):
        if not value or not isinstance(value, list) or len(value) == 0:
            raise ValueError("Debe haber al menos un participante")
        return value

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: str
