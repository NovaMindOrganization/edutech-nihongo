import json

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.llm import _gemini_generate, chat_tutor
from app.core.prompts import load_prompt

router = APIRouter(prefix='/community', tags=['community'])


class TranscriptLine(BaseModel):
    speaker: str
    text: str


class EvaluateRequest(BaseModel):
    transcripts: list[TranscriptLine] = Field(default_factory=list)


class SpeakerFeedback(BaseModel):
    speaker: str
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    sample_correction: str | None = None


class EvaluateResponse(BaseModel):
    summary: str
    feedback_per_speaker: list[SpeakerFeedback] = Field(default_factory=list)


def _gemini_evaluate(transcripts: list[TranscriptLine]) -> EvaluateResponse | None:
    import re

    if not settings.gemini_key:
        return None

    system = load_prompt('community-eval')
    user_block = (
        f'Transcripts:\n{json.dumps([t.model_dump() for t in transcripts], ensure_ascii=False)}'
    )
    text = _gemini_generate([{'text': f'System: {system}'}, {'text': user_block}])
    if not text:
        return None
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group())
        return EvaluateResponse(
            summary=data.get('summary', ''),
            feedback_per_speaker=[
                SpeakerFeedback(**fb) for fb in data.get('feedback_per_speaker', [])
            ],
        )
    except Exception:
        return None


@router.post('/evaluate', response_model=EvaluateResponse)
def evaluate_call(body: EvaluateRequest) -> EvaluateResponse:
    if not body.transcripts:
        return EvaluateResponse(summary='Không có transcript để đánh giá.', feedback_per_speaker=[])

    parsed = _gemini_evaluate(body.transcripts)
    if parsed:
        return parsed

    combined = '\n'.join(f'{t.speaker}: {t.text}' for t in body.transcripts)
    tutor = chat_tutor(
        f'Đánh giá ngắn gọn buổi luyện nói:\n{combined}',
        [],
        prompt_name='community-eval',
    )
    summary = tutor.AI_Reply if tutor else 'Đã ghi nhận buổi luyện nói.'
    return EvaluateResponse(summary=summary, feedback_per_speaker=[])
