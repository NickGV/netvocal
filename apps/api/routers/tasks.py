from fastapi import APIRouter, status
from typing import List
from apps.api.services.task_service import service as task_service
from apps.api.schemas.task_schema import Task, TaskCreate

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[Task])
def list_tasks():
    return task_service.get_tasks()

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate):
    return task_service.add_task(task)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str):
    task_service.delete_task(task_id)
    return
