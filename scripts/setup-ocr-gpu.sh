#!/usr/bin/env bash
# PP-OCRv5 + GPU for NihongoCoach ai-server (Linux + NVIDIA)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AI="$ROOT/server/ai-server"

echo "=== NihongoCoach OCR GPU setup ==="
echo "Engine: PP-OCRv5 (PaddleOCR 3.x, lang=japan)"
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

echo "[2/4] PaddleOCR 3.x (PP-OCRv5) + image deps..."
python -m pip install -r "$AI/requirements-ocr.txt"

echo "[3/4] torch/NCCL sanity (paddlex → modelscope needs working torch)..."
if ! python - <<'PY'
import torch
print("torch", torch.__version__, "cuda", torch.cuda.is_available())
PY
then
  echo "Reinstalling torch cu128..."
  python -m pip install --force-reinstall "torch==2.11.0+cu128" \
    --index-url https://download.pytorch.org/whl/cu128
fi

echo "[4/4] Verify..."
python - <<'PY'
import paddle
from paddleocr import PaddleOCR

cuda = paddle.device.is_compiled_with_cuda()
print("paddle:", paddle.__version__, "cuda:", cuda)
device = "gpu:0" if cuda else "cpu"
ocr = PaddleOCR(
    lang="japan",
    ocr_version="PP-OCRv5",
    text_detection_model_name="PP-OCRv5_server_det",
    text_recognition_model_name="PP-OCRv5_server_rec",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=True,
    device=device,
)
print("PP-OCRv5 japan OK, device=", device)
PY

echo ""
echo "Set in server/ai-server/.env:"
echo "  OCR_ENGINE=paddleocr"
echo "  OCR_USE_GPU=true"
echo "  OCR_PP_OCR_MODEL=server   # or mobile for lower VRAM/latency"
echo "Restart: uvicorn app.main:app --reload --port 8000"
