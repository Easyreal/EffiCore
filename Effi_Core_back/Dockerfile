FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    libjpeg-dev \
    libpng-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app


ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VIRTUALENVS_CREATE=false


COPY requirements.txt /app/requirements.txt

RUN pip install --upgrade pip \
  && pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

