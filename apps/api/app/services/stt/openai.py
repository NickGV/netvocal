from openai import AsyncOpenAI

from app.services.stt.base import STTService


class OpenAIWhisperSTTService(STTService):
    def __init__(self, api_key: str, model: str = "whisper-1") -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        transcript = await self._client.audio.transcriptions.create(
            model=self._model,
            file=(filename, audio_bytes),
        )
        return transcript.text
