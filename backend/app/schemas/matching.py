from datetime import datetime

from pydantic import BaseModel


class MatchingResponse(BaseModel):
    id: int
    offer_id: int
    cv_id: int
    overall_score: float
    skill_score: float
    experience_score: float
    relevance_score: float
    ai_summary: str | None
    strengths: list[str] | None
    weaknesses: list[str] | None
    candidate_name: str | None = None
    candidate_email: str | None = None
    file_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchingListResponse(BaseModel):
    items: list[MatchingResponse]
    total: int
    page: int
    page_size: int
