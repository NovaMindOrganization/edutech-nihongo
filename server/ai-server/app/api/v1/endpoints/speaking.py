from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import (
    SESSION_START_MARKER,
    LlmReply,
    _gemini_generate,
    _parse_json_content,
    chat_with_prompt,
    openai_compatible_chat,
)
from app.core.llm_runtime import apply_llm_config, get_llm_config
from app.core.prompts import render_prompt
from app.schemas.llm_config import LlmConfigPayload

router = APIRouter(prefix='/speaking', tags=['speaking'])


class HistoryItem(BaseModel):
    role: str
    content: str


class SpeakingRequest(BaseModel):
    text: str
    conversation_history: list[HistoryItem] = Field(default_factory=list)
    mode: str = 'free'
    target_lang: str = 'vi'
    llm_config: LlmConfigPayload | None = None


TARGET_LANG_LABELS: dict[str, str] = {
    'vi': 'Vietnamese',
    'en': 'English',
    'ja': 'Japanese',
}


def _build_translate_prompt(text: str, target_lang: str) -> tuple[str, str]:
    target_name = TARGET_LANG_LABELS.get(target_lang, target_lang)
    system = render_prompt('community-translate', target_name=target_name)
    user = render_prompt(
        'community-translate-user',
        target_name=target_name,
        text=text.strip(),
    )
    return system, user


def _normalize_translate_reply(raw: str | None) -> str:
    if not raw:
        return ''
    text = raw.strip()
    if text.startswith('{'):
        parsed = _parse_json_content(text)
        if parsed and parsed.AI_Reply:
            return parsed.AI_Reply.strip()
    return text


class LessonContext(BaseModel):
    lesson_title: str = ''
    jlpt_level: str = 'N5'
    lesson_objective: str | None = None
    lesson_description: str | None = None
    speaking_prompt: str | None = None
    vocabulary: list[str] = Field(default_factory=list)
    grammar: list[str] = Field(default_factory=list)


class LessonSpeakingRequest(BaseModel):
    text: str
    conversation_history: list[HistoryItem] = Field(default_factory=list)
    lesson_context: LessonContext
    llm_config: LlmConfigPayload | None = None


class SpeakingStartRequest(BaseModel):
    llm_config: LlmConfigPayload | None = None


class LessonStartRequest(LessonContext):
    llm_config: LlmConfigPayload | None = None


class SpeakingResponse(BaseModel):
    AI_Reply: str
    Correction: str | None = None
    error: str | None = None


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
def speaking_start(body: SpeakingStartRequest = SpeakingStartRequest()) -> SpeakingResponse:
    """Free conversation: opening greeting."""
    apply_llm_config(body.llm_config)
    parsed = chat_with_prompt('speaking-free', SESSION_START_MARKER, [])
    return _to_response(parsed, SESSION_START_MARKER)


@router.post('/message', response_model=SpeakingResponse)
def speaking_message(body: SpeakingRequest) -> SpeakingResponse:
    apply_llm_config(body.llm_config)

    if body.mode == 'translate':
        system, user = _build_translate_prompt(body.text, body.target_lang)
        cfg = get_llm_config()
        llm_error: str | None = None
        if cfg.provider == 'agent_router':
            if not cfg.openai_api_key:
                return SpeakingResponse(
                    AI_Reply='',
                    error='Missing Agent Router API key (admin LLM config)',
                )
            result = openai_compatible_chat(
                [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': user},
                ],
                temperature=0.2,
            )
            reply = _normalize_translate_reply(result.content)
            llm_error = result.error if not reply else None
        else:
            if not cfg.gemini_api_key:
                return SpeakingResponse(
                    AI_Reply='',
                    error='Missing Gemini API key (admin LLM config or .env)',
                )
            raw = _gemini_generate(
                [{'text': f'System: {system}'}, {'text': user}],
            )
            reply = _normalize_translate_reply(raw)
            if not reply:
                llm_error = 'Gemini returned empty response'
        return SpeakingResponse(AI_Reply=reply, Correction=None, error=llm_error)

    parsed = chat_with_prompt(
        'speaking-free',
        body.text,
        _history_to_dict(body.conversation_history),
    )
    return _to_response(parsed, body.text)


@router.post('/lesson/start', response_model=SpeakingResponse)
def lesson_speaking_start(body: LessonStartRequest) -> SpeakingResponse:
    apply_llm_config(body.llm_config)
    extra = _lesson_extra(body)
    parsed = chat_with_prompt('speaking-lesson', SESSION_START_MARKER, [], system_extra=extra)
    return _to_response(parsed, SESSION_START_MARKER, lesson=True)


@router.post('/lesson', response_model=SpeakingResponse)
def lesson_speaking(body: LessonSpeakingRequest) -> SpeakingResponse:
    apply_llm_config(body.llm_config)
    extra = _lesson_extra(body.lesson_context)
    parsed = chat_with_prompt(
        'speaking-lesson',
        body.text,
        _history_to_dict(body.conversation_history),
        system_extra=extra,
    )
    return _to_response(parsed, body.text, lesson=True)


def _lesson_extra(ctx: LessonContext) -> str:
    vocab = ", ".join(ctx.vocabulary[:20]) or "(none)"
    grammar = ", ".join(ctx.grammar[:10]) or "(none)"
    teacher = ctx.speaking_prompt or "Practice only what this lesson teaches."
    objective = ctx.lesson_objective or ""
    description = ctx.lesson_description or ""
    scope_lines = [
        f"Lesson: {ctx.lesson_title} ({ctx.jlpt_level})",
        f"Speaking scenario (authoritative): {teacher}",
    ]
    if objective:
        scope_lines.append(f"Lesson objective: {objective}")
    if description:
        scope_lines.append(f"Lesson description: {description}")
    scope_lines.extend(
        [
            f"Allowed vocabulary (prefer these words): {vocab}",
            f"Allowed grammar patterns: {grammar}",
            "STRICT SCOPE: Ask and answer ONLY within this lesson's scenario, vocabulary, and grammar.",
            "Do NOT introduce new topics (weather, travel, random hobbies, future lessons).",
            "If the student goes off-topic: briefly acknowledge in Japanese, then redirect to the current lesson task.",
            "Advance step-by-step through the speaking scenario only; do not re-ask info already in history.",
        ]
    )
    return "\n".join(scope_lines)
