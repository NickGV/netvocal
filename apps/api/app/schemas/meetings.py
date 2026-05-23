from datetime import datetime

from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    ends_at: datetime


class Meeting(BaseModel):
    id: str
    title: str
    starts_at: datetime
    ends_at: datetime
