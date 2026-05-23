from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any

class IntentRequest(BaseModel):
    query: str = Field(..., description="Input de usuario natural a interpretar")

class IntentType(str):
    TASK_CREATE = "create_task"
    MEETING_SCHEDULE = "schedule_meeting"
    GENERAL_QUERY = "general_query"
    UNKNOWN = "unknown"

class IntentResponse(BaseModel):
    intent: str = Field(..., description="Nombre de la intención detectada")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
