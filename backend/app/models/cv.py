import enum
from datetime import datetime

from sqlalchemy import (
    String,
    Text,
    Integer,
    Enum,
    DateTime,
    ForeignKey,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CVStatus(str, enum.Enum):
    PENDING = "pending"
    PARSING = "parsing"
    PARSED = "parsed"
    ERROR = "error"


class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class CV(Base):
    __tablename__ = "cvs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    offer_id: Mapped[int] = mapped_column(ForeignKey("offers.id"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(100))
    status: Mapped[CVStatus] = mapped_column(Enum(CVStatus), default=CVStatus.PENDING)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Extracted data
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    candidate_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    candidate_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    candidate_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    education: Mapped[list | None] = mapped_column(JSON, nullable=True)
    experiences: Mapped[list | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    offer: Mapped["Offer"] = relationship(back_populates="cvs")
    skills: Mapped[list["CVSkill"]] = relationship(
        back_populates="cv", cascade="all, delete-orphan"
    )
    matchings: Mapped[list["Matching"]] = relationship(back_populates="cv")


class CVSkill(Base):
    __tablename__ = "cv_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cv_id: Mapped[int] = mapped_column(ForeignKey("cvs.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    level: Mapped[SkillLevel] = mapped_column(
        Enum(SkillLevel), default=SkillLevel.INTERMEDIATE
    )

    cv: Mapped["CV"] = relationship(back_populates="skills")
    skill: Mapped["Skill"] = relationship()
