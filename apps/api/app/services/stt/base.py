from __future__ import annotations

from abc import ABC, abstractmethod


class STTService(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        raise NotImplementedError
