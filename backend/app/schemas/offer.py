from datetime import datetime

from pydantic import BaseModel, Field


class SkillWeight(BaseModel):
    skill_name: str
    weight: int = Field(ge=1, le=5, default=3)
    category: str = "other"


class OfferCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str | None = None
    contract_type: str
    experience_min: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    education: str | None = None
    status: str = "draft"
    skills: list[SkillWeight] = []


class OfferUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    contract_type: str | None = None
    experience_min: int | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    education: str | None = None
    status: str | None = None
    skills: list[SkillWeight] | None = None


class OfferSkillResponse(BaseModel):
    skill_name: str
    weight: int
    category: str

    model_config = {"from_attributes": True}


class OfferResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    location: str | None
    contract_type: str
    experience_min: int | None
    salary_min: int | None
    salary_max: int | None
    education: str | None
    status: str
    skills: list[OfferSkillResponse] = []
    cv_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OfferListResponse(BaseModel):
    items: list[OfferResponse]
    total: int
    page: int
    page_size: int
