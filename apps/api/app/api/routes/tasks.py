from fastapi import APIRouter

from app.schemas.tasks import Task, TaskCreate

router = APIRouter()


@router.get("/", response_model=list[Task])
async def list_tasks() -> list[Task]:
    # Mocked; persistence will be introduced later.
    return []


@router.post("/", response_model=Task)
async def create_task(payload: TaskCreate) -> Task:
    # Mocked; return an echo response.
    return Task(id="task_mock_1", title=payload.title, due_at=payload.due_at)
