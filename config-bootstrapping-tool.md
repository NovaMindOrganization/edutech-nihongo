# Cấu hình bootstrap (snapshot checklist)

File được tạo tự động bởi `bootstrapping-project.sh` — **2026-05-25T11:19:28+07:00**.

## Dự án
- **Tên:** `edutech-nihongo`
- **Thư mục:** `/home/hl0812/Documents/edutech-nihongo`
- **Dùng thư mục sẵn có:** Không

## Frontend
- **Framework:** React + Vite (SPA)
- **Node (client):** v22 LTS

### Frontend Dependencies
- **State Management:** Zustand
- **Data Fetching:** @tanstack/react-query
- **Form:** react-hook-form + zod + @hookform/resolvers
- **Routing:** react-router-dom
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui

## Backend
- **Express (`server/app-server/`):** Có
- **FastAPI (`server/ai-server/`):** Có
- **Conda env (ai-server):** `edutech-nihongo`
- **Python (conda):** `3.12`
- **Node (app-server):** v24 LTS

### Node backend dependencies (`server/app-server/`)
- **ORM / DB client:** @prisma/client + Prisma CLI
- **Authentication:** jose (JWT / JWE)
- **Validation:** Zod
- **HTTP client:** Axios
- **Logging:** Không cài
- **cors:** Có
- **express-rate-limit:** Có
- **helmet:** Có
- **Swagger (swagger-ui-express + swagger-jsdoc):** Có
- **Job queue:** Không cài
- **Email:** Không cài
- **supertest:** Có

### Python backend dependencies (`server/ai-server/`)
- **ORM / database:** SQLAlchemy + Alembic (mở rộng)
- **Authentication:** python-jose + passlib + bcrypt
- **HTTP client:** httpx (async)
- **Task queue:** Không cài
- **Logging:** Không cài
- **CORS:** Built-in FastAPI/Starlette (không thêm gói pip)
- **slowapi:** Không
- **Swagger (fastapi-offline):** Có
- **Email:** Không cài
- **pytest + pytest-asyncio (+ httpx cho TestClient):** Có

## AI / RAG
- **RAG:** Có
- **Vector DB:** pgvector (PostgreSQL)
- **Framework:** LangChain

## Database (cờ trong checklist)
- **PostgreSQL:** Có

## Công cụ dự án
- **Git init:** Không
- **.cursor (clone rules):** Có
  - **Protocol:** `ssh`
  - **URL:** `git@github.com:while-linhhq/rulesCursor.git`
- **Docker Compose (tuỳ chọn checklist):** Có
- **MinIO:** Có
- **Redis:** Có

## Ghi chú
- **Frontend** luôn nằm trong `client/`: mã nguồn chính là `client/src/` (đúng với monorepo — `client` là app FE).
- **Backend Node (Express)** nằm trong `server/app-server/`; **FastAPI (AI)** trong `server/ai-server/` — cùng cha `server/`.
- Nếu từng thấy `src/` hoặc `tailwind.config.js` ở **root** repo (cạnh `package.json` gốc): đó là lỗi cũ — có thể xóa các path đó ở root; FE chuẩn chỉ trong `client/`.
- Thư mục `client/` không có `package.json` (chạy dở): lần chạy bootstrap sau sẽ xóa và tạo lại `client/` đầy đủ.

