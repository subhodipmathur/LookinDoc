# LookinDoc

> **Look inside. Understand more.**

**LookinDoc** is an NLP-powered Document Intelligence Platform designed to ingest documents (PDF, DOCX, TXT) and automatically perform text extraction, statistical analysis, TF-IDF keyword extraction, Named Entity Recognition (NER), extractive summarization, relevance-based passage search, and retrieval-based question answering.

---

## Architecture Overview

```text
                    USER
                      │
                      ▼
             ┌─────────────────┐
             │ React + Vite    │
             │ TypeScript      │
             │ Tailwind CSS    │
             └────────┬────────┘
                      │
                      │ HTTP / JSON
                      ▼
             ┌─────────────────┐
             │ FastAPI Backend │
             └────────┬────────┘
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
     Document      NLP Engine   Database
     Processing                 Supabase
          │           │            │
          │           │            ├── PostgreSQL
          │           │            └── Storage
          │           │
          │           ├── NLTK
          │           ├── spaCy
          │           ├── TF-IDF
          │           └── Cosine Similarity
          │
          ├── PDF (PyMuPDF)
          ├── DOCX (python-docx)
          └── TXT (UTF-8 / Latin)
```

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios, React Router.
- **Backend**: Python 3.13+, FastAPI, Pydantic v2, Uvicorn, Supabase-py.
- **Document Processing**: PyMuPDF (fitz), python-docx.
- **NLP & Intelligence**: spaCy, NLTK, scikit-learn (TF-IDF + Cosine Similarity).
- **Database & Storage**: Supabase PostgreSQL & Supabase Storage.

---

## Supabase Setup

### 1. Create a Supabase Project
1. Create an account at [supabase.com](https://supabase.com).
2. Create a new project (e.g. `lookindoc`).
3. Under **Settings → API**:
   - Copy **Project URL** (`https://<project-ref>.supabase.co`).
   - Copy **`service_role`** key (keep this strictly on the backend).

### 2. Apply Database Migrations
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open [`supabase/migrations/20261004000000_initial_schema.sql`](file:///d:/NLP%20miniproject/supabase/migrations/20261004000000_initial_schema.sql).
3. Paste and run the SQL script. This creates:
   - `documents` (with cascading delete and automatic `updated_at` trigger)
   - `keywords`
   - `entities`
   - `summaries`
   - `chunks`
   - Indexes on foreign keys and timestamps

### 3. Create Storage Bucket
1. Go to **Storage → Buckets**.
2. Create a private bucket named `documents`.
3. Set file size limit to 40MB.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/documents/upload` | Upload & extract PDF, DOCX, or TXT file |
| `GET` | `/api/documents` | List documents (lightweight metadata) |
| `GET` | `/api/documents/{id}` | Get full document metadata |
| `DELETE` | `/api/documents/{id}` | Delete document, storage file & analysis |

---

## Local Development Setup

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows Powershell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Health Check: `http://localhost:8000/api/health`
- Documents API: `http://localhost:8000/api/documents`
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend App: `http://localhost:5173`
- Upload Page: `http://localhost:5173/upload`
- Dashboard: `http://localhost:5173/dashboard`
- Workspace: `http://localhost:5173/documents/:id`
