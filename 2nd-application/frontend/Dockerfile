
# STAGE 1: Build Environment
FROM python:3.12-alpine AS builder
# Fix: Added '=' signs for multi-line ENV variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
# Install build tools needed for C-extensions
RUN apk update && apk add --no-cache gcc python3-dev musl-dev
# Create the virtual environment
RUN python -m venv /opt/venv
# Fix: Explicitly use the virtual environment's pip to guarantee package placement
COPY requirements.txt .
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt
# STAGE 2: Runtime Environment
FROM python:3.12-alpine AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app
# Create a secure non-root system user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
USER appuser
# Fix: Corrected the builder spelling and copied the successfully populated venv
COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appuser . .

EXPOSE 5000

CMD ["python", "app.py"]
