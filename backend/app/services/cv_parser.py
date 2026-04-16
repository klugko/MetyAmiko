import json
import logging
import re

import anthropic

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.cv import CV, CVSkill, CVStatus, SkillLevel
from app.models.skill import Skill, SkillCategory
from app.services.matching_engine import run_matching_for_cv

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """You are an expert HR/recruitment assistant specialized in parsing CVs/resumes.
Extract structured data from the raw CV text provided. Return ONLY valid JSON with this exact schema:
{
  "candidateName": "string",
  "email": "string or null",
  "phone": "string or null",
  "experienceYears": integer,
  "skills": [{"name": "string", "level": "beginner|intermediate|advanced|expert", "category": "technical|soft_skill|language|tool|other"}],
  "education": [{"degree": "string", "school": "string", "year": "string or null"}],
  "experiences": [{"title": "string", "company": "string", "duration": "string", "description": "string"}]
}
Be thorough but concise. Extract all skills mentioned. Estimate experience years from work history."""


def extract_text_from_pdf(content: bytes) -> str:
    from pypdf import PdfReader
    import io

    reader = PdfReader(io.BytesIO(content))
    text_parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_parts.append(text)
    raw = "\n".join(text_parts)
    if len(raw.strip()) < 50:
        raise ValueError("PDF appears to be scanned or contains no extractable text")
    return _clean_text(raw)


def extract_text_from_docx(content: bytes) -> str:
    from docx import Document
    import io

    doc = Document(io.BytesIO(content))
    text_parts = [p.text for p in doc.paragraphs if p.text.strip()]
    raw = "\n".join(text_parts)
    if len(raw.strip()) < 50:
        raise ValueError("DOCX contains insufficient text content")
    return _clean_text(raw)


def _clean_text(text: str) -> str:
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_structured_data(raw_text: str) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model=settings.CLAUDE_MODEL_PARSING,
        max_tokens=4096,
        system=[{"type": "text", "text": EXTRACTION_SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": f"Parse this CV:\n\n{raw_text[:8000]}"}],
    )
    response_text = message.content[0].text
    json_match = re.search(r"\{[\s\S]*\}", response_text)
    if not json_match:
        raise ValueError("AI response did not contain valid JSON")
    return json.loads(json_match.group())


def process_cv(cv_id: int, content: bytes, mime_type: str):
    db = SessionLocal()
    try:
        cv = db.query(CV).filter(CV.id == cv_id).first()
        if not cv:
            return

        cv.status = CVStatus.PARSING
        db.commit()

        # Step 1: Extract raw text
        if mime_type == "application/pdf":
            raw_text = extract_text_from_pdf(content)
        else:
            raw_text = extract_text_from_docx(content)

        cv.raw_text = raw_text

        # Step 2: Extract structured data via AI
        data = extract_structured_data(raw_text)

        cv.candidate_name = data.get("candidateName")
        cv.candidate_email = data.get("email")
        cv.candidate_phone = data.get("phone")
        cv.experience_years = data.get("experienceYears", 0)
        cv.education = data.get("education", [])
        cv.experiences = data.get("experiences", [])

        # Step 3: Save skills
        for skill_data in data.get("skills", []):
            skill_name = skill_data.get("name", "").strip()
            if not skill_name:
                continue
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                cat = SkillCategory.OTHER
                try:
                    cat = SkillCategory(skill_data.get("category", "other"))
                except ValueError:
                    pass
                skill = Skill(name=skill_name, category=cat)
                db.add(skill)
                db.flush()

            level = SkillLevel.INTERMEDIATE
            try:
                level = SkillLevel(skill_data.get("level", "intermediate"))
            except ValueError:
                pass
            cv_skill = CVSkill(cv_id=cv.id, skill_id=skill.id, level=level)
            db.add(cv_skill)

        cv.status = CVStatus.PARSED
        db.commit()

        # Step 4: Trigger matching
        run_matching_for_cv(cv.id, cv.offer_id)

    except Exception as e:
        logger.error(f"CV processing failed for cv_id={cv_id}: {e}")
        db.rollback()
        cv = db.query(CV).filter(CV.id == cv_id).first()
        if cv:
            cv.status = CVStatus.ERROR
            cv.error_message = str(e)[:500]
            db.commit()
    finally:
        db.close()
