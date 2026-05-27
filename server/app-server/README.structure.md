# `server/app-server/` layout (Express + TypeScript)

Layers (see `be--nodejs-structure.mdc` in your Cursor rules):

`config/` → `routes/` → `middlewares/` → `validators/` → `controllers/` → `services/` → `models/` → DB

- **routes/** — map URL + verb to controller (no business logic).
- **controllers/** — HTTP boundary; call services; no DB queries.
- **services/** — business logic and orchestration.
- **models/** — data access / schema.
- **middlewares/** — auth, logging, error handler (last).
- **validators/** — Zod/Joi at the boundary.
- **tests/unit/** — services, utils | **tests/integration/** — HTTP routes
