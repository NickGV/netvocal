from fastapi import APIRouter

from app.schemas.meetings import Meeting, MeetingCreate

router = APIRouter()


@router.get("/", response_model=list[Meeting])
async def list_meetings() -> list[Meeting]:
    # Mocked; persistence will be introduced later.
    return []


@router.post("/", response_model=Meeting)
async def create_meeting(payload: MeetingCreate) -> Meeting:
    # Mocked; return an echo response.
    return Meeting(
        id="meeting_mock_1",
        title=payload.title,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
