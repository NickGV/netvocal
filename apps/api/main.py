from fastapi import FastAPI
from apps.api.routers import tasks

app = FastAPI()
app.include_router(tasks.router)
