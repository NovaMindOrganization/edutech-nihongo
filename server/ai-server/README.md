# FastAPI AI Service

Layered layout is documented in `README.structure.md` (Cursor rule: `backend-fastapi-structure.mdc`).

## Môi trường conda (đã cấu hình khi bootstrap)

- **Tên env:** `edutech-nihongo`
- **Python:** `3.12`
- Dependencies đã được `pip install -r requirements.txt` trong env này khi chạy scaffold (chạy lại pip nếu bạn sửa file requirements).

## Quick start

```bash
conda activate edutech-nihongo
cd server/ai-server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Japanese OCR (GPU)

Default engine: **PaddleOCR** (`lang=japan`) — best open-source choice for JLPT/edu text (printed + 縦書き).

```bash
# From repo root (NVIDIA GPU + CUDA 11.8 wheels by default)
bash scripts/setup-ocr-gpu.sh
```

Env: `OCR_ENGINE=paddleocr`, `OCR_USE_GPU=true`. Status: `GET /api/v1/ocr/status`.

Optional: `GOOGLE_VISION_API_KEY` for cloud fallback only.
