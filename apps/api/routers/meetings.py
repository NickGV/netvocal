from fastapi import APIRouter, status
from typing import List
from apps.api.services.meeting_service import service as meeting_service
from apps.api.schemas.meeting_schema import Meeting, MeetingCreate

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.get("/", response_model=List[Meeting])
def list_meetings():
    return meeting_service.get_meetings()

@router.post("/", response_model=Meeting, status_code=status.HTTP_201_CREATED)
def create_meeting(meeting: MeetingCreate):
    return meeting_service.add_meeting(meeting)

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: str):
    meeting_service.delete_meeting(meeting_id)
    return
