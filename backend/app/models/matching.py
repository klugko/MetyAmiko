from datetime import datetime

from sqlalchemy import (
    Text,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Matching(Base):
    __tablename__ = "matchings"
    __table_args__ = (
        UniqueConstraint("offer_id", "cv_id", name="uq_matching_offer_cv"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    offer_id: Mapped[int] = mapped_column(ForeignKey("offers.id"), index=True)
    cv_id: Mapped[int] = mapped_column(ForeignKey("cvs.id"), index=True)

    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    skill_score: Mapped[float] = mapped_column(Float, default=0.0)
    experience_score: Mapped[float] = mapped_column(Float, default=0.0)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)

    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    offer: Mapped["Offer"] = relationship(back_populates="matchings")
    cv: Mapped["CV"] = relationship(back_populates="matchings")
