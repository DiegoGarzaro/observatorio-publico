FROM python:3.12-slim

WORKDIR /app

# uv para instalação de dependências
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Instala dependências antes de copiar o código (melhor cache)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copia o código
COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
