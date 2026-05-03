from app.services.stt.base import STTService


class MockSTTService(STTService):
    async def transcribe(self, audio_bytes: bytes) -> str:
        return "(mock transcript)"
