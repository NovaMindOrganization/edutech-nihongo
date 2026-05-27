from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import explain_homework_japanese
from app.ocr.service import extract_japanese_text, get_ocr_status

router = APIRouter(prefix='/ocr', tags=['ocr'])


class OcrRequest(BaseModel):
    image: str


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


@router.get('/status')
def ocr_status() -> dict:
    return get_ocr_status()


@router.post('/analyze', response_model=OcrResponse)
def analyze_ocr(body: OcrRequest) -> OcrResponse:
    text, meta = extract_japanese_text(body.image)
    matches = _vector_search(text) if text else {'vocabulary': [], 'grammar': []}
    explanation = _grammar_hint(text, matches) if text else None

    meta_resp = None
    if meta:
        meta_resp = OcrMetaResponse(
            engine=meta.engine,
            gpu=meta.gpu,
            lang=meta.lang,
            confidence_avg=meta.confidence_avg,
            line_count=meta.line_count,
            processing_ms=meta.processing_ms,
        )

    return OcrResponse(
        extracted_text=text,
        matched_vocabulary=matches.get('vocabulary', []),
        matched_grammar=matches.get('grammar', []),
        grammar_explanation=explanation,
        meta=meta_resp,
    )


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
