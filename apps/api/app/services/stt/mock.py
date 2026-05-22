from app.services.stt.base import STTService


class MockSTTService(STTService):
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        _ = filename
        return "(mock transcript)"
