# SmartSpace

Production-shaped starter for a low-cost SmartSpace MVP:

- `Streamlit` UI for buyer, seller, and admin workflows
- `FastAPI` backend for chat, listings, recommendations, and document flows
- `PostgreSQL` with `PostGIS` and `pgvector` as the single primary database
- `mock` LLM mode by default so the app runs before Gemini is wired

## Project Layout

```text
smartspace/
├── backend/
├── streamlit_app/
├── infra/
├── docker-compose.yml
└── pyproject.toml
```

## Run Locally

1. Copy `.env.example` to `.env`.
2. Start Postgres:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

4. Start the API:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Start Streamlit:

```bash
streamlit run streamlit_app/Home.py
```

## Current State

- API endpoints are scaffolded and return production-shaped JSON responses.
- Database models cover the initial buyer, seller, recommendation, and document flows.
- The LLM integration is behind a single service boundary and currently runs in `mock` mode.
- When you share the Gemini API key later, the next step is wiring the real adapter in `backend/app/services/gemini.py`.

## Next Build Steps

1. Add Alembic migrations.
2. Add file storage for images, audio, and PDFs.
3. Replace mock recommendation logic with real listing ingestion and ranking.
4. Add async workers for OCR, embeddings, and long-running tasks.

# Smartspace-The-AI-Real-Estate-Companion
