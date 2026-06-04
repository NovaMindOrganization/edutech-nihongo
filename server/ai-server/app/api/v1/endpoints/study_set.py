import json
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import _gemini_generate, openai_raw_generate
from app.core.llm_runtime import apply_llm_config, get_llm_config
from app.core.prompts import render_prompt
from app.schemas.llm_config import LlmConfigPayload

router = APIRouter(prefix='/study-set', tags=['study-set'])


class StudySetQuizItem(BaseModel):
    content_type: str
    content: dict = Field(default_factory=dict)


class GenerateQuizRequest(BaseModel):
    title: str
    description: str | None = None
    question_count: int = Field(default=10, ge=3, le=30)
    items: list[StudySetQuizItem] = Field(default_factory=list)
    llm_config: LlmConfigPayload | None = None


class QuizQuestionOut(BaseModel):
    id: str
    prompt: str
    choices: list[str]
    answer: int
    explanation: str | None = None


class GenerateQuizResponse(BaseModel):
    questions: list[QuizQuestionOut] = Field(default_factory=list)
    error: str | None = None


def _parse_quiz_json(text: str) -> GenerateQuizResponse | None:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group())
        raw_questions = data.get('questions') or []
        questions: list[QuizQuestionOut] = []
        for i, q in enumerate(raw_questions):
            if not isinstance(q, dict):
                continue
            choices = [str(c).strip() for c in (q.get('choices') or []) if str(c).strip()]
            if len(choices) < 2:
                continue
            answer = int(q.get('answer', 0))
            if answer < 0 or answer >= len(choices):
                answer = 0
            questions.append(
                QuizQuestionOut(
                    id=str(q.get('id') or f'q{i + 1}'),
                    prompt=str(q.get('prompt') or '').strip(),
                    choices=choices[:4] if len(choices) >= 4 else choices,
                    answer=answer,
                    explanation=(str(q.get('explanation')).strip() if q.get('explanation') else None),
                ),
            )
        if not questions:
            return None
        return GenerateQuizResponse(questions=questions)
    except Exception:
        return None


def _normalize_four_choices(questions: list[QuizQuestionOut]) -> list[QuizQuestionOut]:
    normalized: list[QuizQuestionOut] = []
    for q in questions:
        choices = list(dict.fromkeys(q.choices))
        while len(choices) < 4:
            choices.append(f'Phương án {len(choices) + 1}')
        choices = choices[:4]
        answer = q.answer if 0 <= q.answer < len(choices) else 0
        if q.choices[answer] not in choices:
            correct_text = q.choices[answer] if q.answer < len(q.choices) else choices[0]
            answer = choices.index(correct_text) if correct_text in choices else 0
        normalized.append(
            QuizQuestionOut(
                id=q.id,
                prompt=q.prompt,
                choices=choices,
                answer=answer,
                explanation=q.explanation,
            ),
        )
    return normalized


@router.post('/quiz/generate', response_model=GenerateQuizResponse)
def generate_quiz(body: GenerateQuizRequest) -> GenerateQuizResponse:
    apply_llm_config(body.llm_config)

    if not body.items:
        return GenerateQuizResponse(questions=[], error='No study set items provided')

    items_payload = [
        {'contentType': it.content_type, 'content': it.content} for it in body.items
    ]
    question_count = max(3, min(30, body.question_count))
    system = render_prompt('study-set-quiz', question_count=str(question_count))
    user = render_prompt(
        'study-set-quiz-user',
        title=body.title,
        description=body.description or '',
        question_count=str(question_count),
        items_json=json.dumps(items_payload, ensure_ascii=False, indent=2),
    )

    cfg = get_llm_config()
    if cfg.provider == 'agent_router':
        text = openai_raw_generate(system, user)
    else:
        if not cfg.gemini_api_key:
            return GenerateQuizResponse(questions=[], error='Gemini API key not configured')
        text = _gemini_generate([{'text': f'System: {system}'}, {'text': user}])

    if not text:
        return GenerateQuizResponse(questions=[], error='Empty response from LLM')

    parsed = _parse_quiz_json(text)
    if not parsed or not parsed.questions:
        return GenerateQuizResponse(
            questions=[],
            error='Could not parse quiz JSON from LLM',
        )

    parsed.questions = _normalize_four_choices(parsed.questions)[:question_count]
    return parsed
