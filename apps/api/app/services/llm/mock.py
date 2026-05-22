from app.services.llm.base import LLMService


class MockLLMService(LLMService):
    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        _ = conversation_history
        return f"(mock) You said: {user_text}".strip()
