import enum
from datetime import datetime

from sqlalchemy import (
    String,
    Text,
    Integer,
    Enum,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    ARCHIVED = "archived"


class ContractType(str, enum.Enum):
    CDI = "cdi"
    CDD = "cdd"
    FREELANCE = "freelance"
    STAGE = "stage"
    ALTERNANCE = "alternance"
    INTERIM = "interim"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contract_type: Mapped[ContractType] = mapped_column(Enum(ContractType))
    experience_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    education: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[OfferStatus] = mapped_column(
        Enum(OfferStatus), default=OfferStatus.DRAFT
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="offers")
    skills: Mapped[list["OfferSkill"]] = relationship(
        back_populates="offer", cascade="all, delete-orphan"
    )
    cvs: Mapped[list["CV"]] = relationship(back_populates="offer")
    matchings: Mapped[list["Matching"]] = relationship(back_populates="offer")


class OfferSkill(Base):
    __tablename__ = "offer_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    offer_id: Mapped[int] = mapped_column(ForeignKey("offers.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    weight: Mapped[int] = mapped_column(Integer, default=3)  # 1-5

    offer: Mapped["Offer"] = relationship(back_populates="skills")
    skill: Mapped["Skill"] = relationship()
