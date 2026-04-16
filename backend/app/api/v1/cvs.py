import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.cv import CV, CVStatus
from app.models.offer import Offer
from app.models.user import User
from app.schemas.cv import CVListResponse, CVResponse
from app.services.cv_parser import process_cv

router = APIRouter(prefix="/offers/{offer_id}/cvs", tags=["cvs"])

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _sanitize_filename(name: str) -> str:
    return re.sub(r"[^\w\s\-.]", "", name).strip()


def _build_cv_response(cv: CV) -> CVResponse:
    skills = [
        {"name": cs.skill.name, "level": cs.level.value, "category": cs.skill.category.value}
        for cs in cv.skills
    ]
    return CVResponse(
        id=cv.id,
        offer_id=cv.offer_id,
        file_name=cv.file_name,
        file_size=cv.file_size,
        mime_type=cv.mime_type,
        status=cv.status.value,
        error_message=cv.error_message,
        candidate_name=cv.candidate_name,
        candidate_email=cv.candidate_email,
        candidate_phone=cv.candidate_phone,
        experience_years=cv.experience_years,
        education=cv.education,
        experiences=cv.experiences,
        skills=skills,
        created_at=cv.created_at,
    )


@router.post("", response_model=CVResponse, status_code=201)
async def upload_cv(
    offer_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    safe_name = _sanitize_filename(file.filename or "unnamed")
    file_path = f"{current_user.id}/{offer_id}/{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{safe_name}"

    # Upload to Supabase Storage
    from app.services.storage import upload_file
    upload_file(file_path, content, file.content_type)

    cv = CV(
        offer_id=offer_id,
        file_name=safe_name,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        status=CVStatus.PENDING,
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)

    background_tasks.add_task(process_cv, cv.id, content, file.content_type)

    return _build_cv_response(cv)


@router.post("/batch", response_model=list[CVResponse], status_code=201)
async def upload_cvs_batch(
    offer_id: int,
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(files) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 files per batch")

    offer = db.query(Offer).filter(
        Offer.id == offer_id,
        Offer.user_id == current_user.id,
        Offer.deleted_at.is_(None),
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    results = []
    for file in files:
        if file.content_type not in ALLOWED_MIME_TYPES:
            continue
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            continue

        safe_name = _sanitize_filename(file.filename or "unnamed")
        file_path = f"{current_user.id}/{offer_id}/{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{safe_name}"

        from app.services.storage import upload_file
        upload_file(file_path, content, file.content_type)

        cv = CV(
            offer_id=offer_id,
            file_name=safe_name,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type,
            status=CVStatus.PENDING,
        )
        db.add(cv)
        db.flush()
        background_tasks.add_task(process_cv, cv.id, content, file.content_type)
        results.append(cv)

    db.commit()
    return [_build_cv_response(cv) for cv in results]


@router.get("", response_model=CVListResponse)
def list_cvs(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id,
        Offer.user_id == current_user.id,
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    cvs = db.query(CV).filter(CV.offer_id == offer_id).order_by(CV.created_at.desc()).all()
    return CVListResponse(
        items=[_build_cv_response(cv) for cv in cvs],
        total=len(cvs),
    )


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(
    offer_id: int,
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offer = db.query(Offer).filter(
        Offer.id == offer_id,
        Offer.user_id == current_user.id,
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    cv = db.query(CV).filter(CV.id == cv_id, CV.offer_id == offer_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return _build_cv_response(cv)


@router.post("/{cv_id}/retry", response_model=CVResponse)
def retry_cv(
    offer_id: int,
    cv_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.offer_id == offer_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    from app.services.storage import download_file
    content = download_file(cv.file_path)

    cv.status = CVStatus.PENDING
    cv.error_message = None
    db.commit()

    background_tasks.add_task(process_cv, cv.id, content, cv.mime_type)
    return _build_cv_response(cv)
