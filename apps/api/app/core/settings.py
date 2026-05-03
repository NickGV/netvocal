from pydantic import BaseModel


class Settings(BaseModel):
    # Keep settings intentionally minimal for now.
    cors_allow_origins: list[str] = ["http://localhost:3000"]
