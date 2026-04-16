from pydantic import BaseModel


class DashboardStats(BaseModel):
    active_offers: int
    total_cvs: int
    total_matchings: int
    avg_score: float


class RecentActivity(BaseModel):
    type: str  # "cv_uploaded", "matching_done"
    description: str
    created_at: str
