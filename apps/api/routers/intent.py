from fastapi import APIRouter
from apps.api.schemas.intent_schema import IntentRequest, IntentResponse
from apps.api.services.intent_parser import service as intent_service

router = APIRouter(prefix="/intent", tags=["intent"])

@router.post("/parse", response_model=IntentResponse)
def parse_intent(input: IntentRequest):
    parsed = intent_service.parse(input.query)
    return IntentResponse(**parsed)
