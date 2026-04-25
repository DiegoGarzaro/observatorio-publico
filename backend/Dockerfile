FROM python:3.12-slim

WORKDIR /app

# Copy uv binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies before copying code (better layer caching)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

# Copy application code
COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8000

# Call uvicorn directly from the venv — avoids uv re-syncing dependencies at boot.
CMD ["./entrypoint.sh"]
