from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.cv import CV
from app.models.matching import Matching
from app.models.offer import Offer, OfferStatus
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_offers = db.query(Offer.id).filter(
        Offer.user_id == current_user.id, Offer.deleted_at.is_(None)
    )
    active_offers = (
        db.query(func.count(Offer.id))
        .filter(
            Offer.user_id == current_user.id,
            Offer.status == OfferStatus.ACTIVE,
            Offer.deleted_at.is_(None),
        )
        .scalar()
    )
    total_cvs = (
        db.query(func.count(CV.id))
        .filter(CV.offer_id.in_(user_offers))
        .scalar()
    )
    total_matchings = (
        db.query(func.count(Matching.id))
        .filter(Matching.offer_id.in_(user_offers))
        .scalar()
    )
    avg_score = (
        db.query(func.avg(Matching.overall_score))
        .filter(Matching.offer_id.in_(user_offers))
        .scalar()
    ) or 0.0

    return DashboardStats(
        active_offers=active_offers,
        total_cvs=total_cvs,
        total_matchings=total_matchings,
        avg_score=round(float(avg_score), 1),
    )
