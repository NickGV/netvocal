from fastapi import APIRouter, HTTPException, status
from uuid import uuid4

from app.schemas.meetings import Meeting, MeetingCreate

router = APIRouter()

_meetings: dict[str, Meeting] = {}


@router.get("/", response_model=list[Meeting])
async def list_meetings() -> list[Meeting]:
    return list(_meetings.values())


@router.post("/", response_model=Meeting)
async def create_meeting(payload: MeetingCreate) -> Meeting:
    meeting = Meeting(
        id=str(uuid4()),
        title=payload.title,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    _meetings[meeting.id] = meeting
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(meeting_id: str):
    if meeting_id not in _meetings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    del _meetings[meeting_id]
