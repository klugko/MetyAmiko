import enum
from datetime import datetime

from sqlalchemy import String, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SkillCategory(str, enum.Enum):
    TECHNICAL = "technical"
    SOFT_SKILL = "soft_skill"
    LANGUAGE = "language"
    TOOL = "tool"
    OTHER = "other"


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[SkillCategory] = mapped_column(
        Enum(SkillCategory), default=SkillCategory.OTHER
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
