#!/usr/bin/env bash
# GPU stack for ai-server: PaddleOCR + faster-whisper (CTranslate2 CUDA)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AI="$ROOT/server/ai-server"

echo "=== NihongoCoach AI GPU setup (Linux + NVIDIA) ==="
nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>/dev/null || {
  echo "ERROR: nvidia-smi not found"
  exit 1
}

if command -v conda >/dev/null 2>&1; then
  # shellcheck disable=SC1091
  source "$(conda info --base)/etc/profile.d/conda.sh"
  conda activate edutech-nihongo
fi

CUDA_GEN="${CUDA_GEN:-cu118}"
echo ""
echo "[1/4] PaddleOCR GPU (${CUDA_GEN})..."
python -m pip install -U pip
python -m pip install paddlepaddle-gpu -i "https://www.paddlepaddle.org.cn/packages/stable/${CUDA_GEN}/"
python -m pip install -r "$AI/requirements-ocr.txt"

echo ""
echo "[2/4] faster-whisper + CTranslate2 (CUDA)..."
python -m pip install -U "faster-whisper>=1.0.0" "ctranslate2>=4.4.0"

echo ""
echo "[3/4] Speech TTS..."
python -m pip install -U "edge-tts>=6.1.0"

echo ""
echo "[4/4] Verify GPU..."
python - <<'PY'
import paddle
from paddleocr import PaddleOCR

print("--- Paddle ---")
cuda_paddle = paddle.device.is_compiled_with_cuda()
print("paddle", paddle.__version__, "cuda:", cuda_paddle)
if cuda_paddle:
    paddle.device.set_device("gpu")
ocr = PaddleOCR(use_angle_cls=True, lang="japan", use_gpu=cuda_paddle, show_log=False)
print("PaddleOCR japan OK")

print("--- faster-whisper ---")
from faster_whisper import WhisperModel

for compute in ("float16", "int8_float16"):
    try:
        m = WhisperModel("base", device="cuda", compute_type=compute)
        del m
        print(f"WhisperModel cuda compute_type={compute} OK")
        break
    except Exception as e:
        print(f"compute_type={compute} failed:", e)
else:
    m = WhisperModel("base", device="cpu", compute_type="int8")
    del m
    print("WhisperModel fallback CPU int8 OK")
PY

echo ""
echo "Update server/ai-server/.env:"
echo "  WHISPER_DEVICE=cuda"
echo "  WHISPER_COMPUTE_TYPE=float16"
echo "  OCR_USE_GPU=true"
echo ""
echo "Restart: cd server/ai-server && uvicorn app.main:app --reload --port 8000"
