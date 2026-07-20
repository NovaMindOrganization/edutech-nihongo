# syntax=docker/dockerfile:1
# CPU-only. Deps in image; app/ bind-mounted from host for hot reload.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/root/.cache/huggingface \
    PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True

RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg libgomp1 libglib2.0-0 libsm6 libxext6 libgl1 curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Force CPU wheels first so sentence-transformers / torch do not pull CUDA (~GB).
RUN pip install --upgrade pip \
  && pip install paddlepaddle==3.0.0 \
       -i https://www.paddlepaddle.org.cn/packages/stable/cpu/ \
  && pip install torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt requirements-ocr.txt ./
RUN pip install -r requirements.txt && pip install -r requirements-ocr.txt

COPY app ./app

EXPOSE 8000
# --reload watches bind-mounted app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "app"]
