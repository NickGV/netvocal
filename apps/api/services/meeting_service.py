from typing import List
from apps.api.schemas.meeting_schema import Meeting, MeetingCreate
from apps.api.stores.meeting_store import store
from fastapi import HTTPException, status

class MeetingService:
    def get_meetings(self) -> List[Meeting]:
        return store.get_all()

    def add_meeting(self, meeting_create: MeetingCreate) -> Meeting:
        return store.add(meeting_create)

    def delete_meeting(self, meeting_id: str) -> None:
        if not store.delete(meeting_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reunión no encontrada")

service = MeetingService()
