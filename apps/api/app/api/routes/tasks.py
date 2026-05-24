from fastapi import APIRouter, HTTPException, status
from uuid import uuid4

from app.schemas.tasks import Task, TaskCreate

router = APIRouter()

_tasks: dict[str, Task] = {}


@router.get("/", response_model=list[Task])
async def list_tasks() -> list[Task]:
    return list(_tasks.values())


@router.post("/", response_model=Task)
async def create_task(payload: TaskCreate) -> Task:
    task = Task(id=str(uuid4()), title=payload.title, due_at=payload.due_at)
    _tasks[task.id] = task
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    if task_id not in _tasks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    del _tasks[task_id]
