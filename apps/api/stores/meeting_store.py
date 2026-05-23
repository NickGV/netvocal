from typing import List, Optional
from apps.api.schemas.meeting_schema import Meeting, MeetingCreate
from uuid import uuid4

class MeetingStore:
    def __init__(self):
        self._meetings = {}
    def get_all(self) -> List[Meeting]:
        return list(self._meetings.values())
    def add(self, meeting_create: MeetingCreate) -> Meeting:
        meeting_id = str(uuid4())
        meeting = Meeting(id=meeting_id, **meeting_create.dict())
        self._meetings[meeting_id] = meeting
        return meeting
    def delete(self, meeting_id: str) -> bool:
        if meeting_id not in self._meetings:
            return False
        del self._meetings[meeting_id]
        return True
    def get(self, meeting_id: str) -> Optional[Meeting]:
        return self._meetings.get(meeting_id)

store = MeetingStore()
