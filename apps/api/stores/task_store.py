from typing import List, Optional
from apps.api.schemas.task_schema import Task, TaskCreate, TaskStatus
from uuid import uuid4
from datetime import datetime

class TaskStore:
    def __init__(self):
        self._tasks = {}
    
    def get_all(self) -> List[Task]:
        return list(self._tasks.values())
    
    def add(self, task_create: TaskCreate) -> Task:
        task_id = str(uuid4())
        task = Task(id=task_id, **task_create.dict())
        self._tasks[task_id] = task
        return task

    def delete(self, task_id: str) -> bool:
        if task_id not in self._tasks:
            return False
        del self._tasks[task_id]
        return True

    def get(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

# Singleton para uso global en la app
store = TaskStore()
