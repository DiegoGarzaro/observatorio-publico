# CLAUDE.md — Observatório Público

Guia de desenvolvimento para o projeto. Leia antes de escrever qualquer código.

---

## Visão Geral

Web app de transparência política brasileira. Centraliza e cruza dados públicos de deputados federais (Câmara dos Deputados), permitindo análise de gastos, atuação legislativa e comparações entre políticos.

Fonte de dados principal: [API aberta da Câmara](https://dadosabertos.camara.leg.br/api/v2) — REST, sem autenticação.

---

## Stack

| Camada     | Tecnologia                                      |
|------------|-------------------------------------------------|
| Backend    | Python 3.12 · FastAPI · SQLAlchemy (async)      |
| Banco      | PostgreSQL 16                                   |
| Cache      | Redis 7                                         |
| Migrations | Alembic                                         |
| ETL        | Scripts Python com `httpx` (async)              |
| Frontend   | Next.js 14+ · TypeScript · Tailwind CSS         |
| Pkg Mgr    | `uv` (Python) · `npm` (Node)                    |

---

## Estrutura do Projeto

```
observatorio_publico/
├── backend/
│   ├── app/
│   │   ├── main.py               # Entrypoint FastAPI
│   │   ├── config.py             # Settings (pydantic-settings)
│   │   ├── database.py           # Engine async + session factory + Base
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── repositories/         # Acesso ao banco (Repository Pattern)
│   │   ├── services/             # Lógica de negócio (Service Layer)
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py     # APIRouter principal
│   │   │       └── endpoints/    # Um arquivo por domínio
│   │   └── etl/                  # Jobs de ingestão de dados
│   ├── alembic/                  # Migrations
│   ├── tests/                    # Testes (espelham a estrutura de app/)
│   ├── .env                      # Variáveis de ambiente (não versionar)
│   ├── .env.example              # Template de variáveis
│   └── pyproject.toml
├── frontend/                     # (a criar)
├── docker-compose.yml            # PostgreSQL + Redis
├── PRD.md
├── TASKS.md
└── DESIGN_SYSTEM.md
```

---

## Comandos Essenciais

### Backend

```bash
# Instalar dependências
uv sync

# Rodar servidor de desenvolvimento
uv run uvicorn app.main:app --reload

# Migrations
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "descrição"

# Lint (obrigatório antes de entregar código)
uv run ruff check .
uv run ruff check . --fix

# Testes
uv run pytest
uv run pytest -v                  # verbose
uv run pytest tests/unit/         # só unitários
uv run pytest tests/integration/  # só integração

# ETL
uv run python -m app.etl.runner
```

### Infraestrutura

```bash
# Subir tudo (banco, cache, backend, frontend)
docker compose up -d

# Subir só a infra (banco + cache), rodar backend e frontend local
docker compose up -d postgres redis

# Hot reload em desenvolvimento (usa docker compose watch)
docker compose watch

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild de um serviço após mudança no Dockerfile
docker compose build backend
docker compose up -d backend

# Derrubar tudo
docker compose down

# Derrubar e apagar volumes (reset completo do banco)
docker compose down -v
```

**Portas:**
| Serviço  | Porta |
|----------|-------|
| Frontend | 3000  |
| Backend  | 8000  |
| Postgres | 5432  |
| Redis    | 6379  |

---

## Padrões de Código

### 1. Repository Pattern

Todo acesso ao banco passa por um repositório. Nunca escreva queries diretamente em services ou endpoints.

```python
# app/repositories/politician_repository.py
class PoliticianRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, politician_id: int) -> Politician | None:
        result = await self._session.get(Politician, politician_id)
        return result

    async def list(self, *, uf: str | None = None, page: int = 1, page_size: int = 20) -> list[Politician]:
        stmt = select(Politician)
        if uf:
            stmt = stmt.where(Politician.uf == uf)
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(stmt)
        return list(result.scalars())
```

### 2. Service Layer

Lógica de negócio fica nos services. Services orquestram repositórios e não conhecem HTTP.

```python
# app/services/politician_service.py
class PoliticianService:
    def __init__(self, repository: PoliticianRepository) -> None:
        self._repository = repository

    async def get_profile(self, politician_id: int) -> PoliticianResponse:
        politician = await self._repository.get_by_id(politician_id)
        if politician is None:
            raise PoliticianNotFoundError(politician_id)
        return PoliticianResponse.model_validate(politician)
```

### 3. Endpoints Finos

Endpoints só fazem injeção de dependência, chamam o service e retornam o schema. Sem lógica.

```python
# app/api/v1/endpoints/politicians.py
@router.get("/{politician_id}", response_model=PoliticianResponse)
async def get_politician(
    politician_id: int,
    session: AsyncSession = Depends(get_session),
) -> PoliticianResponse:
    repository = PoliticianRepository(session)
    service = PoliticianService(repository)
    return await service.get_profile(politician_id)
```

### 4. Schemas Separados por Domínio

Nunca exponha o ORM model diretamente. Use schemas Pydantic distintos para request e response.

```python
# app/schemas/politician.py
class PoliticianListItem(BaseModel):
    id: int
    name: str
    party: str
    uf: str
    photo_url: str | None

    model_config = ConfigDict(from_attributes=True)

class PoliticianResponse(PoliticianListItem):
    email: str | None
    phone: str | None
    legislature: int
```

### 5. Erros de Domínio

Erros de negócio são exceções próprias, convertidas para HTTP no handler global.

```python
# app/exceptions.py
class NotFoundError(Exception):
    def __init__(self, entity: str, entity_id: int | str) -> None:
        self.entity = entity
        self.entity_id = entity_id
        super().__init__(f"{entity} {entity_id} not found")

class PoliticianNotFoundError(NotFoundError):
    def __init__(self, politician_id: int) -> None:
        super().__init__("Politician", politician_id)
```

```python
# app/main.py — handler global
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

---

## Docstrings

Sempre Google-style com tipos explícitos nos Args e Returns.

```python
async def get_expenses_summary(
    self,
    politician_id: int,
    year: int,
) -> ExpenseSummary:
    """Calculates the expense summary for a politician in a given year.

    Args:
        politician_id (int): Internal ID of the politician.
        year (int): Reference year for the summary.

    Returns:
        ExpenseSummary: Totals broken down by category and month.

    Raises:
        PoliticianNotFoundError: If no politician exists with the given ID.
    """
```

---

## TDD — Abordagem de Testes

### Estrutura

```
tests/
├── unit/
│   ├── services/         # Testa services com repositórios mockados
│   └── schemas/          # Testa validação e serialização de schemas
├── integration/
│   ├── repositories/     # Testa repositórios com banco real (fixtures)
│   └── api/              # Testa endpoints com TestClient + banco real
└── conftest.py           # Fixtures compartilhadas
```

### Regras

- **Testes unitários** — serviços testados com repositórios mockados (`unittest.mock.AsyncMock`)
- **Testes de integração** — repositórios e endpoints testados contra um banco PostgreSQL real (não SQLite)
- **Não mockar o banco** — mocks de DB escondem bugs de SQL e comportamento de transação
- **Fixtures idempotentes** — cada teste cria e limpa seus próprios dados
- **Nomes descritivos** — `test_get_politician_returns_404_when_not_found`
- **Arrange / Act / Assert** — separar as três fases com linha em branco

```python
# tests/unit/services/test_politician_service.py
async def test_get_profile_raises_not_found_when_politician_missing():
    # Arrange
    repository = AsyncMock(spec=PoliticianRepository)
    repository.get_by_id.return_value = None
    service = PoliticianService(repository)

    # Act / Assert
    with pytest.raises(PoliticianNotFoundError):
        await service.get_profile(politician_id=999)
```

```python
# tests/integration/api/test_politicians.py
async def test_get_politician_returns_correct_data(client: AsyncClient, db_politician: Politician):
    # Act
    response = await client.get(f"/api/v1/politicians/{db_politician.id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == db_politician.name
```

### `conftest.py` — fixtures base

```python
@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as s:
        yield s
        await s.rollback()  # isola cada teste

@pytest.fixture
async def client(session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    app.dependency_overrides[get_session] = lambda: session
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

---

## ETL — Ingestão de Dados

- Scripts em `app/etl/`, um arquivo por fonte de dados
- Sempre idempotente: use `INSERT ... ON CONFLICT DO UPDATE` (upsert por `external_id`)
- Logar início, fim, total processado e erros de cada job
- Nunca quebrar a ingestão inteira por um registro ruim — logar e continuar
- Respeitar rate limits da Câmara (máx ~10 req/s)

```python
# Padrão de upsert
stmt = insert(Politician).values(**data)
stmt = stmt.on_conflict_do_update(
    index_elements=["external_id"],
    set_={k: stmt.excluded[k] for k in data if k != "external_id"},
)
await session.execute(stmt)
```

---

## API — Convenções

- Versionamento via prefixo: `/api/v1/`
- Respostas paginadas com envelope: `{"items": [...], "total": N, "page": N, "page_size": N}`
- Erros seguem RFC 9457: `{"detail": "mensagem legível"}`
- Query params em `snake_case`, nunca camelCase
- Sempre documentar o endpoint com `summary` e `description` no decorator

---

## Variáveis de Ambiente

| Variável              | Descrição                        | Exemplo                                             |
|-----------------------|----------------------------------|-----------------------------------------------------|
| `DATABASE_URL`        | Conexão async PostgreSQL         | `postgresql+asyncpg://user:pass@localhost/db`       |
| `REDIS_URL`           | Conexão Redis                    | `redis://localhost:6379`                            |
| `CAMARA_API_BASE_URL` | Base URL da API da Câmara        | `https://dadosabertos.camara.leg.br/api/v2`         |
| `APP_ENV`             | Ambiente (`development`/`production`) | `development`                                  |
| `APP_DEBUG`           | Ativa SQL echo e logs detalhados | `true`                                              |

---

## Git

- Commits em inglês, imperativos: `add politician endpoint`, `fix expense upsert`, `refactor service layer`
- Branches: `feat/`, `fix/`, `refactor/`, `chore/`
- Não commitar `.env` — apenas `.env.example`
- Rodar `ruff check .` antes de cada commit

---

## Componentes Frontend

### Regra principal

**Nunca use HTML puro para elementos de interface.** Sempre use os componentes de `@/components/ui`.

```tsx
// ERRADO
<button className="bg-green-400 ...">Buscar</button>
<div className="border rounded ...">...</div>

// CERTO
import { Button, Card } from "@/components/ui"
<Button variant="primary">Buscar</Button>
<Card>...</Card>
```

### Componentes disponíveis em `src/components/ui/`

| Componente     | Uso                                         |
|----------------|---------------------------------------------|
| `Button`       | Ações — variantes: `primary`, `secondary`, `ghost`, `danger` |
| `Card`         | Container padrão de conteúdo                |
| `CardHeader`   | Cabeçalho de card com título e ação         |
| `Input`        | Campo de texto com label, ícone e erro      |
| `Select`       | Dropdown tipado com placeholder             |
| `Badge`        | Status — variantes: `default`, `positive`, `warning`, `danger`, `accent` |
| `StatCard`     | KPI: label + valor + badge opcional         |
| `Avatar`       | Foto do político com fallback de iniciais   |
| `Spinner`      | Indicador de carregamento inline            |
| `Skeleton`     | Placeholder de carregamento de bloco        |
| `SkeletonCard` | Skeleton pré-montado para cards             |
| `SkeletonTable`| Skeleton pré-montado para tabelas           |
| `Table`        | Tabela com `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `Pagination`   | Controle de página com contagem             |
| `EmptyState`   | Estado vazio com título, descrição e ação   |

### Criando novos componentes

Componentes de domínio ficam em `src/components/features/`. Componentes base reutilizáveis ficam em `src/components/ui/` e **devem ser exportados no barrel `index.ts`**.

```tsx
// src/components/features/politician-card.tsx
import { Avatar, Badge, Card } from "@/components/ui"

export function PoliticianCard({ politician }: { politician: PoliticianListItem }) {
  return (
    <Card hover>
      <Avatar src={politician.photo_url} name={politician.name} size="md" />
      ...
    </Card>
  )
}
```

---

## O que Não Fazer

- Não escrever lógica de negócio em endpoints
- Não acessar o banco diretamente em services (sempre via repository)
- Não expor ORM models como response — sempre usar schemas Pydantic
- Não criar abstrações antes de ter 3+ casos de uso reais
- Não adicionar campos, tratamentos ou features que não foram pedidos
- Não mockar o banco em testes de integração
- Não usar `SELECT *` — sempre selecionar colunas explicitamente
