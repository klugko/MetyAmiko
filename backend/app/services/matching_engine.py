import json
import logging
import re

import anthropic

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.cv import CV, CVStatus
from app.models.matching import Matching
from app.models.offer import Offer, OfferSkill

logger = logging.getLogger(__name__)

MATCHING_SYSTEM_PROMPT = """You are an expert HR/recruitment matching engine. Your role is to evaluate how well a candidate's CV matches a job offer.

Analyze the match between the job requirements and the candidate profile. Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "skillScore": 0-100,
  "experienceScore": 0-100,
  "relevanceScore": 0-100,
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1"],
  "summary": "2-3 sentence professional summary of the match"
}

Scoring guide:
- skillScore: How well candidate's skills match required skills (consider weights)
- experienceScore: How well candidate's experience level matches requirements
- relevanceScore: Overall relevance of candidate's background to the role
- overallScore: Weighted composite (skills 50%, experience 30%, relevance 20%)

Be objective, specific, and constructive. Reference actual skills and experience from the CV."""


def _build_offer_context(offer: Offer) -> str:
    skills_text = ", ".join(
        f"{os.skill.name} (weight: {os.weight}/5)" for os in offer.skills
    )
    return f"""JOB OFFER:
Title: {offer.title}
Description: {offer.description}
Location: {offer.location or 'Not specified'}
Contract: {offer.contract_type.value}
Min Experience: {offer.experience_min or 'Not specified'} years
Required Skills: {skills_text or 'Not specified'}
Education: {offer.education or 'Not specified'}"""


def _build_cv_context(cv: CV) -> str:
    skills_text = ", ".join(
        f"{cs.skill.name} ({cs.level.value})" for cs in cv.skills
    )
    return f"""CANDIDATE CV:
Name: {cv.candidate_name or 'Unknown'}
Experience: {cv.experience_years or 'Unknown'} years
Skills: {skills_text or 'Not specified'}
Raw CV Text (excerpt):
{(cv.raw_text or '')[:3000]}"""


def match_cv_to_offer(offer: Offer, cv: CV) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    offer_context = _build_offer_context(offer)
    cv_context = _build_cv_context(cv)

    message = client.messages.create(
        model=settings.CLAUDE_MODEL_MATCHING,
        max_tokens=2048,
        system=[{"type": "text", "text": MATCHING_SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[
            {
                "role": "user",
                "content": f"{offer_context}\n\n---\n\n{cv_context}\n\nScore this match.",
            }
        ],
    )
    response_text = message.content[0].text
    json_match = re.search(r"\{[\s\S]*\}", response_text)
    if not json_match:
        raise ValueError("AI response did not contain valid JSON")
    return json.loads(json_match.group())


def run_matching_for_cv(cv_id: int, offer_id: int):
    db = SessionLocal()
    try:
        cv = db.query(CV).filter(CV.id == cv_id, CV.status == CVStatus.PARSED).first()
        if not cv:
            return

        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return

        existing = (
            db.query(Matching)
            .filter(Matching.offer_id == offer_id, Matching.cv_id == cv_id)
            .first()
        )
        if existing:
            return

        result = match_cv_to_offer(offer, cv)

        matching = Matching(
            offer_id=offer_id,
            cv_id=cv_id,
            overall_score=round(result.get("overallScore", 0), 1),
            skill_score=round(result.get("skillScore", 0), 1),
            experience_score=round(result.get("experienceScore", 0), 1),
            relevance_score=round(result.get("relevanceScore", 0), 1),
            ai_summary=result.get("summary"),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
        )
        db.add(matching)
        db.commit()
    except Exception as e:
        logger.error(f"Matching failed for cv_id={cv_id}, offer_id={offer_id}: {e}")
        db.rollback()
    finally:
        db.close()


def run_matching_for_offer(offer_id: int):
    db = SessionLocal()
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return

        cvs = (
            db.query(CV)
            .filter(CV.offer_id == offer_id, CV.status == CVStatus.PARSED)
            .all()
        )
        cv_ids = [cv.id for cv in cvs]
        db.close()

        for cv_id in cv_ids:
            run_matching_for_cv(cv_id, offer_id)
    except Exception as e:
        logger.error(f"Batch matching failed for offer_id={offer_id}: {e}")
    finally:
        if not db.is_active:
            db = SessionLocal()
        db.close()
