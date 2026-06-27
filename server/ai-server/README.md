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
python -m uvicorn app.main:app --reload --port 8000
```

Từ repo root (đã có conda env `edutech-nihongo`):

```bash
pnpm run dev:ai-server
```

Mở http://localhost:8000/docs — thấy Swagger là server đã chạy.

### Chạy hàng ngày (3 terminal)

| Terminal | Lệnh | Port |
|----------|------|------|
| 1 | `pnpm run dev:ai-server` (từ repo root) | 8000 |
| 2 | `pnpm run dev:app-server` | 4000 |
| 3 | `pnpm run dev:client` | 5173 |

`app-server/.env` cần `AI_SERVER_URL=http://localhost:8000`.

### Test nhanh — không cần thử hết Swagger

| Muốn test | API / UI | Cần gì |
|-----------|----------|--------|
| Server sống | `GET /api/v1/health` | Chỉ cần ai-server |
| Gemini / LLM | Admin → Kiểm tra Gemini | `GEMINI_API_KEY` (AIzaSy…) |
| Luyện nói bài học | UI: Bài học → **Luyện nói** | Gemini + ai-server + app-server |
| TTS (loa) | Nút loa trong luyện nói | `edge-tts` (`pip install edge-tts`) |
| STT (mic) | Ghi âm trong luyện nói | Whisper local hoặc Gemini fallback |
| **Chấm phát âm** | Mic trong **Luyện nói** (sau khi dừng ghi) | **Azure Speech** (xem bên dưới) |

### Chấm phát âm (Pronunciation Assessment)

Cần trong `server/ai-server/.env`:

```env
PA_ENGINE=azure
AZURE_SPEECH_KEY=your-key
AZURE_SPEECH_REGION=southeastasia
```

Tạo key: [Azure Portal](https://portal.azure.com) → **Speech** resource → Keys and Endpoint.

Cần **ffmpeg** trên PATH (chuyển webm → wav). Kiểm tra: `ffmpeg -version`.

**Test trên UI:** đăng nhập học viên → mở bài học → tab **Luyện nói** → nhập câu tiếng Nhật (vd. `こんにちは`) → bấm mic → nói → dừng → xem điểm **Pronunciation**.

**Test Swagger:** `POST /api/v1/speech/pronunciation/assess/upload` — `reference_text` = câu mẫu, `audio_file` = file ghi âm `.webm`/`.wav`.

## Japanese OCR (GPU)

Default engine: **PP-OCRv5** (`lang=japan`, PaddleOCR 3.x) — printed + 縦書き.

```bash
# From repo root (NVIDIA GPU + CUDA 11.8 wheels by default)
bash scripts/setup-ocr-gpu.sh
```

Env: `OCR_ENGINE=paddleocr`, `OCR_USE_GPU=true`, `OCR_PP_OCR_MODEL=server|mobile`. Status: `GET /api/v1/ocr/status`.

Optional: `GOOGLE_VISION_API_KEY` for cloud fallback only.
