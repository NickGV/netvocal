from app.services.llm.base import LLMService


class MockLLMService(LLMService):
    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "system" and "intención" in msg["text"].lower():
                    lower = user_text.lower()
                    if "crea" in lower or "crear" in lower:
                        return "create_task"
                    if "agenda" in lower:
                        return "schedule_meeting"
                    if any(w in lower for w in ["tarea", "tareas"]):
                        return "list_tasks"
                    if any(w in lower for w in ["reunión", "reuniones", "reunion"]):
                        return "list_meetings"
                    return "general"
        return f"(mock) You said: {user_text}"
