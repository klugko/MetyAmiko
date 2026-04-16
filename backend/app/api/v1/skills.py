from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import SkillResponse

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
def search_skills(
    q: str = Query("", min_length=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Skill)
    if q:
        query = query.filter(Skill.name.ilike(f"%{q}%"))
    return query.order_by(Skill.name).limit(50).all()
