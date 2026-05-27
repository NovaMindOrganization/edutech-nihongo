#!/usr/bin/env bash
# PaddleOCR + GPU for NihongoCoach ai-server (Linux + NVIDIA)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AI="$ROOT/server/ai-server"

echo "=== NihongoCoach OCR GPU setup ==="
echo "Engine: PaddleOCR lang=japan (best OSS for JP printed + vertical text)"
echo ""

if command -v conda >/dev/null 2>&1; then
  # shellcheck disable=SC1091
  source "$(conda info --base)/etc/profile.d/conda.sh"
  conda activate edutech-nihongo 2>/dev/null || echo "Tip: conda activate edutech-nihongo"
fi

CUDA_GEN="${CUDA_GEN:-cu118}"
echo "[1/3] paddlepaddle-gpu (${CUDA_GEN})..."
python -m pip install -U pip
python -m pip install paddlepaddle-gpu -i "https://www.paddlepaddle.org.cn/packages/stable/${CUDA_GEN}/"

echo "[2/3] PaddleOCR 2.x + image deps (avoid 3.x — breaks classic API)..."
python -m pip install -r "$AI/requirements-ocr.txt"

echo "[3/3] Verify..."
python - <<'PY'
import paddle
from paddleocr import PaddleOCR

cuda = paddle.device.is_compiled_with_cuda()
print("paddle:", paddle.__version__, "cuda:", cuda)
ocr = PaddleOCR(use_angle_cls=True, lang="japan", use_gpu=cuda, show_log=False)
print("PaddleOCR japan OK, gpu=", cuda)
PY

echo ""
echo "Set in server/ai-server/.env:"
echo "  OCR_ENGINE=paddleocr"
echo "  OCR_USE_GPU=true"
echo "Restart: uvicorn app.main:app --reload --port 8000"
