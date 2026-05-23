from __future__ import annotations

from abc import ABC, abstractmethod


class LLMService(ABC):
    @abstractmethod
    async def generate_reply(self, user_text: str, conversation_history: list[dict] | None = None) -> str:
        raise NotImplementedError
