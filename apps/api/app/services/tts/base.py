from __future__ import annotations

from abc import ABC, abstractmethod


class TTSService(ABC):
    @abstractmethod
    async def synthesize(self, text: str) -> bytes:
        raise NotImplementedError
