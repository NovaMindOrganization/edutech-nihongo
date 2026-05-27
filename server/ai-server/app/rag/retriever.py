"""Semantic search — uses DB text match when embeddings unavailable."""

import os

import httpx


def search_similar(text: str, limit_vocab: int = 10, limit_grammar: int = 5) -> dict:
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        return {'vocabulary': [], 'grammar': []}

    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(db_url)
        q = f'%{text[:20]}%'
        with engine.connect() as conn:
            vocab = conn.execute(
                text(
                    'SELECT id, word, reading, meaning FROM vocabulary '
                    'WHERE word ILIKE :q OR meaning ILIKE :q LIMIT :lim',
                ),
                {'q': q, 'lim': limit_vocab},
            ).mappings().all()
            grammar = conn.execute(
                text(
                    'SELECT id, pattern, meaning FROM grammar '
                    'WHERE pattern ILIKE :q OR meaning ILIKE :q LIMIT :lim',
                ),
                {'q': q, 'lim': limit_grammar},
            ).mappings().all()
        return {
            'vocabulary': [dict(r) for r in vocab],
            'grammar': [dict(r) for r in grammar],
        }
    except Exception:
        return {'vocabulary': [], 'grammar': []}


def retrieve(query: str, top_k: int = 5) -> list[dict]:
    result = search_similar(query, limit_vocab=top_k, limit_grammar=0)
    return result.get('vocabulary', [])
