import json
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import _gemini_generate, explain_homework_japanese, openai_raw_generate
from app.core.llm_runtime import apply_llm_config, get_llm_config
from app.core.prompts import render_prompt
from app.ocr.service import extract_japanese_text, get_ocr_status
from app.schemas.llm_config import LlmConfigPayload

router = APIRouter(prefix='/ocr', tags=['ocr'])


class OcrRequest(BaseModel):
    image: str
    llm_config: LlmConfigPayload | None = None


class OcrMetaResponse(BaseModel):
    engine: str
    gpu: bool
    lang: str
    confidence_avg: float | None = None
    line_count: int = 0
    processing_ms: int = 0


class OcrResponse(BaseModel):
    extracted_text: str
    matched_vocabulary: list[dict] = Field(default_factory=list)
    matched_grammar: list[dict] = Field(default_factory=list)
    grammar_explanation: str | None = None
    meta: OcrMetaResponse | None = None


class OcrQuizRequest(BaseModel):
    image: str
    question_count: int = Field(default=5, ge=3, le=20)
    llm_config: LlmConfigPayload | None = None


class QuizQuestionOut(BaseModel):
    id: str
    prompt: str
    choices: list[str]
    answer: int
    explanation: str | None = None


class OcrQuizResponse(BaseModel):
    extracted_text: str
    questions: list[QuizQuestionOut] = Field(default_factory=list)
    error: str | None = None
    meta: OcrMetaResponse | None = None


class OcrGradeRequest(BaseModel):
    image: str
    context: str | None = None
    llm_config: LlmConfigPayload | None = None


class GradingErrorOut(BaseModel):
    location: str
    student_answer: str
    correct_answer: str
    explanation: str


class OcrGradeResponse(BaseModel):
    extracted_text: str
    errors: list[GradingErrorOut] = Field(default_factory=list)
    overall_feedback: str = ''
    score_estimate: str | None = None
    error: str | None = None
    meta: OcrMetaResponse | None = None


def _meta_to_response(meta) -> OcrMetaResponse | None:
    if not meta:
        return None
    return OcrMetaResponse(
        engine=meta.engine,
        gpu=meta.gpu,
        lang=meta.lang,
        confidence_avg=meta.confidence_avg,
        line_count=meta.line_count,
        processing_ms=meta.processing_ms,
    )


def _llm_raw(system: str, user: str) -> str | None:
    cfg = get_llm_config()
    if cfg.provider == 'agent_router':
        return openai_raw_generate(system, user)
    if not cfg.gemini_api_key:
        return None
    return _gemini_generate([{'text': f'System: {system}'}, {'text': user}])


def _parse_quiz_json(text: str) -> list[QuizQuestionOut]:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        return []
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
            while len(choices) < 4:
                choices.append(f'Phương án {len(choices) + 1}')
            choices = choices[:4]
            questions.append(
                QuizQuestionOut(
                    id=str(q.get('id') or f'q{i + 1}'),
                    prompt=str(q.get('prompt') or '').strip(),
                    choices=choices,
                    answer=answer if answer < 4 else 0,
                    explanation=(
                        str(q.get('explanation')).strip() if q.get('explanation') else None
                    ),
                ),
            )
        return questions
    except Exception:
        return []


def _parse_grade_json(text: str) -> OcrGradeResponse | None:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group())
        errors: list[GradingErrorOut] = []
        for item in data.get('errors') or []:
            if not isinstance(item, dict):
                continue
            location = str(item.get('location') or '').strip()
            if not location:
                location = '—'
            errors.append(
                GradingErrorOut(
                    location=location,
                    student_answer=str(item.get('student_answer') or '').strip(),
                    correct_answer=str(item.get('correct_answer') or '').strip(),
                    explanation=str(item.get('explanation') or '').strip(),
                ),
            )
        overall = str(data.get('overall_feedback') or '').strip()
        score = data.get('score_estimate')
        score_estimate = str(score).strip() if score is not None and str(score).strip() else None
        return OcrGradeResponse(
            extracted_text='',
            errors=errors,
            overall_feedback=overall or 'Không có nhận xét tổng quan.',
            score_estimate=score_estimate,
        )
    except Exception:
        return None


@router.get('/status')
def ocr_status() -> dict:
    return get_ocr_status()


@router.post('/analyze', response_model=OcrResponse)
def analyze_ocr(body: OcrRequest) -> OcrResponse:
    apply_llm_config(body.llm_config)
    text, meta = extract_japanese_text(body.image)
    matches = _vector_search(text) if text else {'vocabulary': [], 'grammar': []}
    explanation = _grammar_hint(text, matches) if text else None

    return OcrResponse(
        extracted_text=text,
        matched_vocabulary=matches.get('vocabulary', []),
        matched_grammar=matches.get('grammar', []),
        grammar_explanation=explanation,
        meta=_meta_to_response(meta),
    )


@router.post('/quiz/generate', response_model=OcrQuizResponse)
def generate_ocr_quiz(body: OcrQuizRequest) -> OcrQuizResponse:
    apply_llm_config(body.llm_config)
    text, meta = extract_japanese_text(body.image)
    if not text or len(text.strip()) < 2:
        return OcrQuizResponse(
            extracted_text=text or '',
            questions=[],
            error='Không nhận diện đủ chữ từ ảnh — thử ảnh rõ hơn',
            meta=_meta_to_response(meta),
        )

    question_count = max(3, min(20, body.question_count))
    system = render_prompt('ocr-quiz', question_count=str(question_count))
    user = render_prompt(
        'ocr-quiz-user',
        question_count=str(question_count),
        extracted_text=text.strip(),
    )

    raw = _llm_raw(system, user)
    if not raw:
        return OcrQuizResponse(
            extracted_text=text,
            questions=[],
            error='LLM không phản hồi — kiểm tra cấu hình API',
            meta=_meta_to_response(meta),
        )

    questions = _parse_quiz_json(raw)[:question_count]
    if not questions:
        return OcrQuizResponse(
            extracted_text=text,
            questions=[],
            error='Không parse được JSON quiz từ LLM',
            meta=_meta_to_response(meta),
        )

    return OcrQuizResponse(
        extracted_text=text,
        questions=questions,
        meta=_meta_to_response(meta),
    )


@router.post('/grade', response_model=OcrGradeResponse)
def grade_ocr_homework(body: OcrGradeRequest) -> OcrGradeResponse:
    apply_llm_config(body.llm_config)
    text, meta = extract_japanese_text(body.image)
    if not text or len(text.strip()) < 2:
        return OcrGradeResponse(
            extracted_text=text or '',
            errors=[],
            overall_feedback='Không nhận diện đủ nội dung bài làm từ ảnh.',
            error='Không nhận diện đủ chữ từ ảnh',
            meta=_meta_to_response(meta),
        )

    context = (body.context or '').strip() or 'Không có'
    system = render_prompt('ocr-grade')
    user = render_prompt(
        'ocr-grade-user',
        context=context,
        extracted_text=text.strip(),
    )

    raw = _llm_raw(system, user)
    if not raw:
        return OcrGradeResponse(
            extracted_text=text,
            errors=[],
            overall_feedback='',
            error='LLM không phản hồi — kiểm tra cấu hình API',
            meta=_meta_to_response(meta),
        )

    parsed = _parse_grade_json(raw)
    if not parsed:
        return OcrGradeResponse(
            extracted_text=text,
            errors=[],
            overall_feedback='',
            error='Không parse được JSON chấm bài từ LLM',
            meta=_meta_to_response(meta),
        )

    parsed.extracted_text = text
    parsed.meta = _meta_to_response(meta)
    return parsed


def _grammar_hint(text: str, matches: dict) -> str | None:
    if len(text) < 4:
        return None

    vocab = [v.get('word', '') for v in matches.get('vocabulary', []) if isinstance(v, dict)]
    grammar = [g.get('pattern', '') for g in matches.get('grammar', []) if isinstance(g, dict)]

    gemini_explain = explain_homework_japanese(text, vocab, grammar)
    if gemini_explain:
        return gemini_explain

    return '認識した文を辞書・文法ノートで確認してください。'


def _vector_search(text: str) -> dict:
    try:
        from app.rag.retriever import search_similar

        return search_similar(text, limit_vocab=10, limit_grammar=5)
    except Exception:
        return {'vocabulary': [], 'grammar': []}
