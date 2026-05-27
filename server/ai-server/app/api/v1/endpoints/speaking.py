from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import SESSION_START_MARKER, LlmReply, chat_with_prompt

router = APIRouter(prefix='/speaking', tags=['speaking'])


class HistoryItem(BaseModel):
    role: str
    content: str


class SpeakingRequest(BaseModel):
    text: str
    conversation_history: list[HistoryItem] = Field(default_factory=list)
    mode: str = 'free'


class LessonContext(BaseModel):
    lesson_title: str = ''
    jlpt_level: str = 'N5'
    speaking_prompt: str | None = None
    vocabulary: list[str] = Field(default_factory=list)
    grammar: list[str] = Field(default_factory=list)


class LessonSpeakingRequest(BaseModel):
    text: str
    conversation_history: list[HistoryItem] = Field(default_factory=list)
    lesson_context: LessonContext


class SpeakingResponse(BaseModel):
    AI_Reply: str
    Correction: str | None = None


def _fallback(user_text: str, *, lesson: bool = False) -> SpeakingResponse:
    if lesson:
        return SpeakingResponse(
            AI_Reply='このレッスンの内容について、もう少し話してみましょう。',
            Correction=None,
        )
    return SpeakingResponse(
        AI_Reply='いいですね。もう少し詳しく話してみましょう。',
        Correction=None if len(user_text) < 3 else '文法を確認してみましょう。',
    )


def _history_to_dict(history: list[HistoryItem]) -> list[dict[str, str]]:
    return [{'role': h.role, 'content': h.content} for h in history]


def _to_response(parsed: LlmReply | None, user_text: str, *, lesson: bool = False) -> SpeakingResponse:
    if parsed and parsed.AI_Reply:
        return SpeakingResponse(AI_Reply=parsed.AI_Reply, Correction=parsed.Correction)
    return _fallback(user_text, lesson=lesson)


@router.post('/start', response_model=SpeakingResponse)
def speaking_start() -> SpeakingResponse:
    """Free conversation: Gemini opening greeting."""
    parsed = chat_with_prompt('speaking-free', SESSION_START_MARKER, [])
    return _to_response(parsed, SESSION_START_MARKER)


@router.post('/message', response_model=SpeakingResponse)
def speaking_message(body: SpeakingRequest) -> SpeakingResponse:
    parsed = chat_with_prompt(
        'speaking-free',
        body.text,
        _history_to_dict(body.conversation_history),
    )
    return _to_response(parsed, body.text)


@router.post('/lesson/start', response_model=SpeakingResponse)
def lesson_speaking_start(body: LessonContext) -> SpeakingResponse:
    extra = _lesson_extra(body)
    parsed = chat_with_prompt('speaking-lesson', SESSION_START_MARKER, [], system_extra=extra)
    return _to_response(parsed, SESSION_START_MARKER, lesson=True)


@router.post('/lesson', response_model=SpeakingResponse)
def lesson_speaking(body: LessonSpeakingRequest) -> SpeakingResponse:
    extra = _lesson_extra(body.lesson_context)
    parsed = chat_with_prompt(
        'speaking-lesson',
        body.text,
        _history_to_dict(body.conversation_history),
        system_extra=extra,
    )
    return _to_response(parsed, body.text, lesson=True)


def _lesson_extra(ctx: LessonContext) -> str:
    return (
        f'Lesson: {ctx.lesson_title} ({ctx.jlpt_level}). '
        f'Focus vocabulary: {", ".join(ctx.vocabulary[:12])}. '
        f'Grammar patterns: {", ".join(ctx.grammar[:8])}. '
        f'Teacher prompt: {ctx.speaking_prompt or "Practice lesson topics only."}'
    )
