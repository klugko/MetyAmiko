from datetime import datetime

from pydantic import BaseModel


class CVResponse(BaseModel):
    id: int
    offer_id: int
    file_name: str
    file_size: int
    mime_type: str
    status: str
    error_message: str | None
    candidate_name: str | None
    candidate_email: str | None
    candidate_phone: str | None
    experience_years: int | None
    education: list | None
    experiences: list | None
    skills: list[dict] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class CVListResponse(BaseModel):
    items: list[CVResponse]
    total: int
