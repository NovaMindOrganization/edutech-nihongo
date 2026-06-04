from functools import lru_cache
from pathlib import Path

PROMPTS_DIR = Path(__file__).resolve().parent.parent / 'prompts'

DEFAULT_JSON_TUTOR = (
    'You are a Japanese language tutor. Respond in Japanese. '
    'Return ONLY valid JSON: {"AI_Reply": "<Japanese>", "Correction": "<string or null>"}'
)


@lru_cache(maxsize=32)
def load_prompt(name: str) -> str:
    """Load prompt template from app/prompts/{name}.md."""
    path = PROMPTS_DIR / f'{name}.md'
    if path.is_file():
        return path.read_text(encoding='utf-8').strip()
    return DEFAULT_JSON_TUTOR


def render_prompt(name: str, **variables: str) -> str:
    """Load prompt template and substitute ``{placeholders}``."""
    template = load_prompt(name)
    if not variables:
        return template
    return template.format(**variables)
