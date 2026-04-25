FROM python:3.12-slim

WORKDIR /app

# Copy uv binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies before copying code (better layer caching)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

# Copy application code
COPY . .

EXPOSE 8000

# Call uvicorn directly from the venv — avoids uv re-syncing dependencies at boot.
CMD ["/app/.venv/bin/uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--no-access-log"]
