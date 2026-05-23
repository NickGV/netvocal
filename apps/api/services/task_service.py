from typing import List
from apps.api.schemas.task_schema import Task, TaskCreate, TaskStatus
from apps.api.stores.task_store import store
from datetime import datetime
from fastapi import HTTPException, status

class TaskService:
    def get_tasks(self) -> List[Task]:
        return store.get_all()

    def add_task(self, task_create: TaskCreate) -> Task:
        # Validación de fechas: si existe, no puede ser pasada
        if task_create.due_date and task_create.due_date < datetime.now():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede asignar una fecha pasada")
        # Validación de status correcto (ya lo hace el schema, redundante)
        # Validación de título está delegada al schema
        return store.add(task_create)

    def delete_task(self, task_id: str) -> None:
        if not store.delete(task_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")

service = TaskService()
