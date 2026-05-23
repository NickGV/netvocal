from openai import AsyncOpenAI

from app.services.llm.base import LLMService


class OpenAILLMService(LLMService):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        messages = self._build_messages(user_text, conversation_history)
        completion = await self._client.chat.completions.create(
            model=self._model,
            messages=messages,
        )
        return completion.choices[0].message.content or ""

    def _build_messages(self, user_text: str, conversation_history: list[dict] | None) -> list[dict]:
        messages: list[dict] = [
            {"role": "system", "content": "Eres un asistente de voz útil. Responde de forma concisa y natural."}
        ]

        if conversation_history:
            for turn in conversation_history:
                role = "assistant" if turn["role"] == "assistant" else "user"
                messages.append({"role": role, "content": turn["text"]})

        messages.append({"role": "user", "content": user_text})
        return messages
