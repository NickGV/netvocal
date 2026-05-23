from fastapi import FastAPI
from apps.api.routers import tasks, meetings, intent

app = FastAPI()
app.include_router(tasks.router)
app.include_router(meetings.router)
app.include_router(intent.router)
