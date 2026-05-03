from app.services.llm.base import LLMService


class MockLLMService(LLMService):
    async def generate_reply(self, user_text: str) -> str:
        return f"(mock) You said: {user_text}".strip()
