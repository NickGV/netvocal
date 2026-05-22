from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_prefix": "VA_"}

    cors_allow_origins: list[str] = ["http://localhost:3000"]
    openai_api_key: str = ""
    stt_provider: str = "mock"
    whisper_model: str = "whisper-1"
    llm_provider: str = "mock"
    llm_model: str = "gpt-4o-mini"
