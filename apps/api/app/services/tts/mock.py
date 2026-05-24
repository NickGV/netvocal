from app.services.tts.base import TTSService


class MockTTSService(TTSService):
    async def synthesize(self, text: str) -> bytes:
        return b""
