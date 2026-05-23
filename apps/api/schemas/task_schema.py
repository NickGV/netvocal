from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=500)
    due_date: Optional[datetime] = Field(None)
    status: TaskStatus = TaskStatus.PENDING

    @validator("due_date", pre=True, always=True)
    def parse_due_date(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value)
            except Exception:
                raise ValueError("due_date must be ISO format (yyyy-mm-ddTHH:MM:SS)")
        if not isinstance(value, datetime):
            raise ValueError("due_date must be datetime")
        return value

class TaskCreate(TaskBase):
    title: str

class Task(TaskBase):
    id: str
