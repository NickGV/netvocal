from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    due_at: datetime | None = None


class Task(BaseModel):
    id: str
    title: str
    due_at: datetime | None = None
