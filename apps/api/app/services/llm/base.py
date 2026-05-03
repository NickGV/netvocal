from __future__ import annotations

from abc import ABC, abstractmethod


class LLMService(ABC):
    @abstractmethod
    async def generate_reply(self, user_text: str) -> str:
        raise NotImplementedError
