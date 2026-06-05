#!/usr/bin/env python3
"""Test Agent Router vision OCR on a sample image.

Usage:
  AGENTROUTER_API_KEY=sk-... python scripts/test-agentrouter-ocr.py [image.png]
"""

from __future__ import annotations

import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / '.env')

from app.core.agentrouter_vision import agentrouter_vision_transcribe
from app.core.llm_runtime import apply_llm_config
from app.schemas.llm_config import LlmConfigPayload

DEFAULT_IMG = (
    Path(__file__).resolve().parents[3]
    / '.cursor/projects/home-hl0812-Documents-edutech-nihongo/assets'
    / 'testocr-d9092364-dd7f-486c-954d-b3c05d78f4d0.png'
)


def main() -> int:
    img_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_IMG
    if not img_path.is_file():
        print(f'Image not found: {img_path}')
        return 1

    api_key = (
        os.getenv('AGENTROUTER_API_KEY')
        or os.getenv('LLM_OPENAI_API_KEY')
        or os.getenv('OPENAI_API_KEY')
    )
    if not api_key:
        print('Set AGENTROUTER_API_KEY or LLM_OPENAI_API_KEY')
        return 1

    model = os.getenv('OCR_AGENTROUTER_VISION_MODEL', 'claude-opus-4-6')
    apply_llm_config(LlmConfigPayload(
        provider='agent_router',
        openai_api_key=api_key,
        openai_base_url=os.getenv('LLM_OPENAI_BASE_URL', 'https://agentrouter.org/v1'),
        openai_model=model,
        temperature=0,
    ))

    b64 = base64.b64encode(img_path.read_bytes()).decode()
    print(f'Testing {img_path.name} with model={model} ...')
    text, engine = agentrouter_vision_transcribe(
        'Transcribe all Japanese text in this worksheet image. Plain text only.',
        image_b64=b64,
        mime_type='image/png',
    )
    if not text:
        print('FAILED:', engine)
        return 2
    print('OK engine:', engine)
    print('---')
    print(text[:2000])
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
