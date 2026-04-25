# Observatório Público

Web app de transparência política brasileira. Centraliza e cruza dados públicos de deputados federais e senadores, permitindo análise de gastos, atuação legislativa, votações e comparações entre políticos.

Fonte de dados: [API aberta da Câmara dos Deputados](https://dadosabertos.camara.leg.br/api/v2) e [API aberta do Senado Federal](https://legis.senado.leg.br/dadosabertos/).

---

## Stack

| Camada     | Tecnologia                                   |
|------------|----------------------------------------------|
| Backend    | Python 3.12 · FastAPI · SQLAlchemy (async)   |
| Banco      | PostgreSQL 16                                |
| Cache      | Redis 7                                      |
| Migrations | Alembic                                      |
| ETL        | Scripts Python com `httpx` (async)           |
| Frontend   | Next.js 14+ · TypeScript · Tailwind CSS      |
| Pkg Mgr    | `uv` (Python) · `npm` (Node)                 |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — gerenciador de pacotes Python
- Node.js 20+ e npm

---

## Setup local (desenvolvimento)

### 1. Clone o repositório

```bash
git clone <repo-url>
cd observatorio_publico
```

### 2. Suba a infraestrutura (banco + cache)

```bash
docker compose up -d postgres redis
```

### 3. Configure o backend

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
```

O `.env.example` já vem com os valores corretos para o ambiente local:

```env
DATABASE_URL=postgresql+asyncpg://observatorio:observatorio@localhost:5432/observatorio
REDIS_URL=redis://localhost:6379
CAMARA_API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2
APP_ENV=development
APP_DEBUG=true
```

### 4. Configure o frontend

```bash
cd frontend
npm install
```

### 5. Rode os servidores

Em terminais separados:

```bash
# Backend
cd backend
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

**Portas:**

| Serviço  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |
| Postgres | localhost:5432               |
| Redis    | localhost:6379               |

---

## ETL — Ingestão de dados

Os dados são ingeridos via scripts ETL que consomem as APIs públicas. O processo é idempotente (pode ser executado várias vezes sem duplicar dados).

### Rodar o ETL completo

```bash
cd backend
uv run python -m app.etl.runner
```

### Opções disponíveis

```bash
# Filtrar por ano (recomendado para primeiro uso)
uv run python -m app.etl.runner --year 2025

# Pular votações (mais rápido, útil para testar)
uv run python -m app.etl.runner --year 2025 --skip-votes

# Pular senadores
uv run python -m app.etl.runner --year 2025 --skip-senators
```

### O que é ingerido

1. **Deputados** — lista e detalhes (foto, email, telefone)
2. **Despesas CEAP** — gastos por deputado e ano
3. **Proposições** — projetos de lei por autor
4. **Votações** — como cada deputado votou em cada sessão
5. **Senadores** — lista e detalhes

> O ETL da Câmara respeita um limite de ~10 req/s e faz retry automático em erros 5xx/timeout com backoff exponencial.

---

## Setup completo via Docker (opcional)

Para rodar tudo em containers (backend + frontend + infra):

```bash
docker compose up -d
```

Com hot reload durante o desenvolvimento:

```bash
docker compose watch
```

---

## Comandos úteis

```bash
# Migrations
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "descrição"

# Lint (obrigatório antes de commitar)
uv run ruff check .
uv run ruff check . --fix

# Testes
uv run pytest
uv run pytest -v
uv run pytest tests/unit/
uv run pytest tests/integration/

# Logs de um serviço Docker
docker compose logs -f backend
docker compose logs -f frontend

# Reset completo do banco
docker compose down -v
docker compose up -d postgres redis
uv run alembic upgrade head
```

---

## Estrutura do projeto

```
observatorio_publico/
├── backend/
│   ├── app/
│   │   ├── main.py               # Entrypoint FastAPI
│   │   ├── config.py             # Settings (pydantic-settings)
│   │   ├── database.py           # Engine async + session factory
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── repositories/         # Acesso ao banco (Repository Pattern)
│   │   ├── services/             # Lógica de negócio
│   │   ├── api/v1/               # Endpoints REST
│   │   └── etl/                  # Jobs de ingestão
│   ├── alembic/                  # Migrations
│   ├── tests/
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── app/                  # Next.js App Router
│       ├── components/
│       │   ├── ui/               # Componentes base
│       │   └── features/         # Componentes de domínio
│       └── lib/                  # API client, hooks, utils
├── docker-compose.yml
├── CLAUDE.md                     # Guia de desenvolvimento
└── TASKS.md                      # Roadmap e tarefas
```

---

## Documentação adicional

- [`CLAUDE.md`](CLAUDE.md) — padrões de código, arquitetura e convenções
- [`TASKS.md`](TASKS.md) — roadmap detalhado por fase
- [`PRD.md`](PRD.md) — product requirements document
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — sistema de design do frontend
- [API Docs](http://localhost:8000/docs) — Swagger UI (com servidor rodando)
