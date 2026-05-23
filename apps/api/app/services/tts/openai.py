from openai import AsyncOpenAI

from app.services.tts.base import TTSService


class OpenAITTSService(TTSService):
    def __init__(
        self,
        api_key: str,
        model: str = "tts-1",
        voice: str = "alloy",
    ) -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model
        self._voice = voice

    async def synthesize(self, text: str) -> bytes:
        """
        Synthesize text to speech using OpenAI TTS API.

        Args:
            text: The text to convert to speech

        Returns:
            Audio bytes (MP3 format by default from OpenAI)
        """
        response = await self._client.audio.speech.create(
            model=self._model,
            voice=self._voice,
            input=text,
        )
        return response.content
