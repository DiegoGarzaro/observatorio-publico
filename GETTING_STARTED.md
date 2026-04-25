# Getting Started — Observatório Público

Guia completo para rodar o projeto localmente e popular os dados.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| Docker + Docker Compose | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Python | 3.12+ | via pyenv ou sistema |
| uv | qualquer | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Node.js | 22+ | [nodejs.org](https://nodejs.org) |

---

## 1. Clone e estrutura

```
observatorio_publico/
├── backend/        FastAPI + ETL
├── frontend/       Next.js
└── docker-compose.yml
```

---

## 2. Suba a infraestrutura

```bash
docker compose up -d postgres redis
```

Aguarde os healthchecks ficarem verdes:

```bash
docker compose ps
# postgres   healthy
# redis      healthy
```

---

## 3. Configure o backend

```bash
cd backend

# Copia o arquivo de variáveis
cp .env.example .env

# Instala dependências
uv sync

# Cria as tabelas no banco
uv run alembic upgrade head
```

### Variáveis de ambiente (`backend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://observatorio:observatorio@localhost:5432/observatorio` | Conexão PostgreSQL |
| `REDIS_URL` | `redis://localhost:6379` | Conexão Redis |
| `CAMARA_API_BASE_URL` | `https://dadosabertos.camara.leg.br/api/v2` | API da Câmara (não precisa mudar) |
| `APP_DEBUG` | `true` | Loga SQL queries no terminal |

---

## 4. Popule os dados (ETL)

O ETL busca dados diretamente da API pública da Câmara dos Deputados — sem autenticação, sem API key.

### Primeira execução (dados completos)

```bash
cd backend

# Importa todos os deputados + despesas do ano atual
uv run python -m app.etl.runner
```

Tempo estimado: **20–40 minutos** (depende da velocidade da API da Câmara e do número de deputados).

O runner executa 3 jobs em sequência:

| Job | O que faz | Tempo |
|---|---|---|
| `ingest_deputies` | Lista todos os 513 deputados + partido + UF | ~1 min |
| `enrich_deputy_details` | Busca email e telefone de cada um (1 req/deputado) | ~8 min |
| `ingest_expenses` | Baixa todas as despesas CEAP (paginado) | ~20–30 min |

### Execução por ano específico

```bash
# Só despesas de 2023
uv run python -m app.etl.runner --year=2023

# Só despesas de 2024
uv run python -m app.etl.runner --year=2024
```

### Re-execução (incremental)

O ETL é idempotente — pode rodar múltiplas vezes sem duplicar dados. Registros existentes são atualizados, novos são inseridos.

```bash
# Seguro rodar novamente a qualquer momento
uv run python -m app.etl.runner
```

---

## 5. Suba o backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

- API disponível em: `http://localhost:8000`
- Documentação interativa: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 6. Configure e suba o frontend

```bash
cd frontend

# Copia o arquivo de variáveis
cp .env.local.example .env.local

# Instala dependências
npm install

# Sobe em modo desenvolvimento
npm run dev
```

- App disponível em: `http://localhost:3000`

### Variáveis de ambiente (`frontend/.env.local`)

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | URL do backend |

---

## 7. Usando o app

### Buscar deputados

Na tela inicial (`/`):
- **Campo de busca**: filtra por nome com debounce automático
- **Partido**: filtra por sigla do partido (PT, PL, MDB…)
- **Estado**: filtra por UF (SP, RJ, MG…)

### Ver perfil de um deputado

Clique em qualquer card da lista. A página de perfil exibe:
- Dados básicos: nome, partido, UF, email, telefone
- **Painel de gastos CEAP**: selecione o ano no canto superior direito
  - Total gasto no ano
  - Gráfico de linha — evolução mensal
  - Gráfico de pizza — distribuição por categoria
  - Insights automáticos (maior categoria, média mensal, mês pico)
  - Tabela detalhada com todos os registros

### API diretamente

```bash
# Listar deputados
curl "http://localhost:8000/api/v1/politicians?page=1&page_size=10"

# Buscar por nome
curl "http://localhost:8000/api/v1/politicians?name=silva&party=PT"

# Perfil de um deputado
curl "http://localhost:8000/api/v1/politicians/1"

# Despesas de 2024
curl "http://localhost:8000/api/v1/politicians/1/expenses?year=2024"

# Resumo para gráficos
curl "http://localhost:8000/api/v1/politicians/1/expenses/summary?year=2024"

# Listar partidos
curl "http://localhost:8000/api/v1/parties"
```

---

## 8. Tudo containerizado (opcional)

Para rodar tudo via Docker sem instalar Python/Node localmente:

```bash
# Build e sobe todos os serviços
docker compose up -d

# Aguarda subir e roda as migrations
docker compose exec backend uv run alembic upgrade head

# Roda o ETL dentro do container
docker compose exec backend uv run python -m app.etl.runner --year=2024
```

Serviços:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Docs API | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 9. Resetar o banco (recomeçar do zero)

```bash
# Para tudo e apaga os volumes
docker compose down -v

# Sobe só a infra
docker compose up -d postgres redis

# Recria as tabelas
cd backend && uv run alembic upgrade head

# Reimporta os dados
uv run python -m app.etl.runner
```

---

## 10. Fontes de dados

| Fonte | URL | Autenticação |
|---|---|---|
| Câmara dos Deputados | https://dadosabertos.camara.leg.br/api/v2 | Não precisa |
| Senado Federal | https://legis.senado.leg.br/dadosabertos | Não precisa |
| Portal da Transparência | https://api.portaldatransparencia.gov.br | API Key gratuita |
| TSE | https://dadosabertos.tse.jus.br | Não precisa |
