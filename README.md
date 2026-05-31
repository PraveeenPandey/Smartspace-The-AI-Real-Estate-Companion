# SmartSpace

Production-shaped starter for a low-cost SmartSpace MVP:

- `Streamlit` UI for buyer, seller, and admin workflows
- `FastAPI` backend for chat, listings, recommendations, and document flows
- `SQLite` by default for zero-setup local development
- optional `PostgreSQL` via Docker when you want a closer production shape
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
2. Install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

3. Start the API:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Start Streamlit:

```bash
streamlit run streamlit_app/Home.py
```

## React UI

The repo also includes a React frontend in `frontend/` for a richer product-facing interface.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The React app expects the FastAPI backend to be running at `http://localhost:8000/api` by default.

Demo UI credentials:

- User: `buyer@smartspace.local` / `User@123`
- Admin: `admin@smartspace.local` / `Admin@123`

## Optional Postgres Mode

If Docker is working and you want a more production-shaped local DB:

1. Run:

```bash
docker compose up -d
```

2. Override your `.env` with:

```bash
SMARTSPACE_DATABASE_URL=postgresql+psycopg://smartspace:smartspace@localhost:5432/smartspace
```

## Current State

- API endpoints are scaffolded and return production-shaped JSON responses.
- Database models cover the initial buyer, seller, recommendation, and document flows.
- The local default uses `SQLite` so development is not blocked by Docker or paid infrastructure.
- The LLM integration is behind a single service boundary and switches to Gemini automatically when a Gemini API key is present.
- When you share the Gemini API key later, the next step is wiring the real adapter in `backend/app/services/gemini.py`.

## Sample Ingestion

The backend ships with a small curated property dataset in `backend/data/sample_properties.json`.
It is ingested automatically at startup and can also be refreshed manually:

```bash
curl -X POST http://localhost:8000/api/ingestion/sample-properties
```

## Next Build Steps

1. Add Alembic migrations.
2. Add file storage for images, audio, and PDFs.
3. Replace mock recommendation logic with real listing ingestion and ranking.
4. Add async workers for OCR, embeddings, and long-running tasks.
