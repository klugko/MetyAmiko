from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.cv import CV, CVStatus
from app.models.matching import Matching
from app.models.offer import Offer
from app.models.user import User
from app.schemas.matching import MatchingListResponse, MatchingResponse
from app.services.matching_engine import run_matching_for_offer

router = APIRouter(prefix="/offers/{offer_id}/matchings", tags=["matchings"])


def _build_matching_response(m: Matching) -> MatchingResponse:
    return MatchingResponse(
        id=m.id,
        offer_id=m.offer_id,
        cv_id=m.cv_id,
        overall_score=m.overall_score,
        skill_score=m.skill_score,
        experience_score=m.experience_score,
        relevance_score=m.relevance_score,
        ai_summary=m.ai_summary,
        strengths=m.strengths,
        weaknesses=m.weaknesses,
        candidate_name=m.cv.candidate_name if m.cv else None,
        candidate_email=m.cv.candidate_email if m.cv else None,
        file_name=m.cv.file_name if m.cv else None,
        created_at=m.created_at,
    )


@router.get("", response_model=MatchingListResponse)
def list_matchings(
    offer_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_score: float | None = None,
    sort_by: str = "overall_score",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id, Offer.user_id == current_user.id
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    query = (
        db.query(Matching)
        .options(joinedload(Matching.cv))
        .filter(Matching.offer_id == offer_id)
    )
    if min_score is not None:
        query = query.filter(Matching.overall_score >= min_score)

    sort_column = getattr(Matching, sort_by, Matching.overall_score)
    query = query.order_by(sort_column.desc())

    total = query.count()
    matchings = query.offset((page - 1) * page_size).limit(page_size).all()
    return MatchingListResponse(
        items=[_build_matching_response(m) for m in matchings],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/run", status_code=202)
def trigger_matching(
    offer_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id, Offer.user_id == current_user.id
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    parsed_count = (
        db.query(func.count(CV.id))
        .filter(CV.offer_id == offer_id, CV.status == CVStatus.PARSED)
        .scalar()
    )
    if parsed_count == 0:
        raise HTTPException(status_code=400, detail="No parsed CVs to match")

    background_tasks.add_task(run_matching_for_offer, offer_id)
    return {"message": f"Matching started for {parsed_count} CVs", "cv_count": parsed_count}


@router.post("/rematch", status_code=202)
def rematch(
    offer_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id, Offer.user_id == current_user.id
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    db.query(Matching).filter(Matching.offer_id == offer_id).delete()
    db.commit()

    background_tasks.add_task(run_matching_for_offer, offer_id)
    return {"message": "Re-matching started"}
