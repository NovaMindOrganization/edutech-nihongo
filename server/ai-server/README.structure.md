# `server/ai-server/` layout (FastAPI)

Layers (see `backend-fastapi-structure.mdc`):

**Client** → `app/api/v1/endpoints/` → `app/services/` → `app/repositories/` → DB (`app/models/`, `app/db/`)

- **api/** — routing only; no business logic in endpoints.
- **services/** — business logic.
- **repositories/** — SQLAlchemy queries only.
- **models/** — ORM models.
- **schemas/** — Pydantic request/response models.
- **core/** — `config.py`, `security.py`.
- **db/** — `session.py`, migrations.
- **utils/** — shared helpers.

Use absolute imports: `from app.core.config import settings`.
