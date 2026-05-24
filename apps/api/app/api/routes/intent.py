from fastapi import APIRouter, Depends
from pydantic import BaseModel
from uuid import uuid4

from app.core.deps import get_llm_service
from app.services.llm.base import LLMService
from app.api.routes.meetings import _meetings
from app.api.routes.tasks import _tasks
from app.schemas.tasks import Task

router = APIRouter()


class IntentRequest(BaseModel):
    query: str


class IntentResponse(BaseModel):
    intent: str
    message: str | None = None


@router.post("/parse", response_model=IntentResponse)
async def parse_intent(payload: IntentRequest, llm: LLMService = Depends(get_llm_service)) -> IntentResponse:
    system_prompt = (
        "Eres un asistente que clasifica la intención del usuario. "
        "Responde SOLO con una de estas palabras: 'create_task', 'schedule_meeting', "
        "'list_tasks', 'list_meetings', o 'general'.\n"
        "- 'create_task' si el usuario quiere crear una tarea\n"
        "- 'schedule_meeting' si quiere agendar una reunión\n"
        "- 'list_tasks' si quiere ver sus tareas\n"
        "- 'list_meetings' si quiere ver sus reuniones\n"
        "- 'general' para cualquier otra cosa"
    )

    raw = await llm.generate_reply(payload.query, conversation_history=[{"role": "system", "text": system_prompt}])
    intent = raw.strip().lower().strip("'\"").split()[0] if raw else "general"

    if intent == "create_task":
        task = Task(id=str(uuid4()), title=payload.query, due_at=None)
        _tasks[task.id] = task
        return IntentResponse(intent=intent, message=f"Tarea creada: {task.title}")
    if intent == "list_tasks":
        count = len(_tasks)
        return IntentResponse(intent=intent, message=f"Tienes {count} tareas." if count else "No tienes tareas.")
    if intent == "list_meetings":
        count = len(_meetings)
        return IntentResponse(intent=intent, message=f"Tienes {count} reuniones." if count else "No tienes reuniones.")
    if intent == "schedule_meeting":
        return IntentResponse(
            intent=intent,
            message="Necesito fecha y hora para agendar la reunión.",
        )
    return IntentResponse(intent=intent)
