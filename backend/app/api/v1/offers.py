from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.cv import CV
from app.models.offer import ContractType, Offer, OfferSkill, OfferStatus
from app.models.skill import Skill, SkillCategory
from app.models.user import User
from app.schemas.offer import (
    OfferCreate,
    OfferListResponse,
    OfferResponse,
    OfferSkillResponse,
    OfferUpdate,
)

router = APIRouter(prefix="/offers", tags=["offers"])


def _build_offer_response(offer: Offer, db: Session) -> OfferResponse:
    cv_count = db.query(func.count(CV.id)).filter(CV.offer_id == offer.id).scalar()
    skills = [
        OfferSkillResponse(
            skill_name=os.skill.name, weight=os.weight, category=os.skill.category.value
        )
        for os in offer.skills
    ]
    return OfferResponse(
        id=offer.id,
        user_id=offer.user_id,
        title=offer.title,
        description=offer.description,
        location=offer.location,
        contract_type=offer.contract_type.value,
        experience_min=offer.experience_min,
        salary_min=offer.salary_min,
        salary_max=offer.salary_max,
        education=offer.education,
        status=offer.status.value,
        skills=skills,
        cv_count=cv_count,
        created_at=offer.created_at,
        updated_at=offer.updated_at,
    )


def _sync_skills(offer: Offer, skills_data: list, db: Session):
    db.query(OfferSkill).filter(OfferSkill.offer_id == offer.id).delete()
    for s in skills_data:
        skill = db.query(Skill).filter(Skill.name == s.skill_name).first()
        if not skill:
            cat = SkillCategory.OTHER
            try:
                cat = SkillCategory(s.category)
            except ValueError:
                pass
            skill = Skill(name=s.skill_name, category=cat)
            db.add(skill)
            db.flush()
        offer_skill = OfferSkill(offer_id=offer.id, skill_id=skill.id, weight=s.weight)
        db.add(offer_skill)


@router.post("", response_model=OfferResponse, status_code=201)
def create_offer(
    payload: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = Offer(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        contract_type=ContractType(payload.contract_type),
        experience_min=payload.experience_min,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        education=payload.education,
        status=OfferStatus(payload.status),
    )
    db.add(offer)
    db.flush()
    if payload.skills:
        _sync_skills(offer, payload.skills, db)
    db.commit()
    db.refresh(offer)
    return _build_offer_response(offer, db)


@router.get("", response_model=OfferListResponse)
def list_offers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    contract_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Offer)
        .options(joinedload(Offer.skills).joinedload(OfferSkill.skill))
        .filter(Offer.user_id == current_user.id, Offer.deleted_at.is_(None))
    )
    if search:
        query = query.filter(
            Offer.title.ilike(f"%{search}%") | Offer.description.ilike(f"%{search}%")
        )
    if status_filter:
        query = query.filter(Offer.status == OfferStatus(status_filter))
    if contract_type:
        query = query.filter(Offer.contract_type == ContractType(contract_type))

    total = query.count()
    offers = (
        query.order_by(Offer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [_build_offer_response(o, db) for o in offers]
    return OfferListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = (
        db.query(Offer)
        .options(joinedload(Offer.skills).joinedload(OfferSkill.skill))
        .filter(
            Offer.id == offer_id,
            Offer.user_id == current_user.id,
            Offer.deleted_at.is_(None),
        )
        .first()
    )
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return _build_offer_response(offer, db)


@router.patch("/{offer_id}", response_model=OfferResponse)
def update_offer(
    offer_id: int,
    payload: OfferUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = (
        db.query(Offer)
        .options(joinedload(Offer.skills).joinedload(OfferSkill.skill))
        .filter(
            Offer.id == offer_id,
            Offer.user_id == current_user.id,
            Offer.deleted_at.is_(None),
        )
        .first()
    )
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "status" in update_data:
        update_data["status"] = OfferStatus(update_data["status"])
    if "contract_type" in update_data:
        update_data["contract_type"] = ContractType(update_data["contract_type"])

    skills_data = update_data.pop("skills", None)
    for field, value in update_data.items():
        setattr(offer, field, value)
    if skills_data is not None:
        from app.schemas.offer import SkillWeight
        parsed_skills = [SkillWeight(**s) if isinstance(s, dict) else s for s in skills_data]
        _sync_skills(offer, parsed_skills, db)
    db.commit()
    db.refresh(offer)
    return _build_offer_response(offer, db)


@router.delete("/{offer_id}", status_code=204)
def delete_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id,
        Offer.user_id == current_user.id,
        Offer.deleted_at.is_(None),
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    from datetime import datetime, timezone
    offer.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.post("/{offer_id}/duplicate", response_model=OfferResponse, status_code=201)
def duplicate_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original = (
        db.query(Offer)
        .options(joinedload(Offer.skills).joinedload(OfferSkill.skill))
        .filter(
            Offer.id == offer_id,
            Offer.user_id == current_user.id,
            Offer.deleted_at.is_(None),
        )
        .first()
    )
    if not original:
        raise HTTPException(status_code=404, detail="Offer not found")

    new_offer = Offer(
        user_id=current_user.id,
        title=f"[Copie] {original.title}",
        description=original.description,
        location=original.location,
        contract_type=original.contract_type,
        experience_min=original.experience_min,
        salary_min=original.salary_min,
        salary_max=original.salary_max,
        education=original.education,
        status=OfferStatus.DRAFT,
    )
    db.add(new_offer)
    db.flush()
    for os in original.skills:
        db.add(OfferSkill(offer_id=new_offer.id, skill_id=os.skill_id, weight=os.weight))
    db.commit()
    db.refresh(new_offer)
    return _build_offer_response(new_offer, db)
