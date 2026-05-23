from fastapi import FastAPI
from apps.api.routers import tasks, meetings

app = FastAPI()
app.include_router(tasks.router)
app.include_router(meetings.router)
