# LookinDoc

> **Look inside. Understand more.**

**LookinDoc** is a full-stack NLP-powered Document Intelligence Platform designed to ingest documents (PDF, DOCX, TXT) and automatically perform text extraction, statistical analysis, TF-IDF keyword extraction, Named Entity Recognition (NER), extractive summarization, relevance-based passage search, and retrieval-based question answering.

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
          │           ├── NLTK Tokenization
          │           ├── spaCy NER
          │           ├── TF-IDF Vectorizer
          │           ├── Cosine Similarity
          │           └── Extractive Summarizer
          │
          ├── PDF (PyMuPDF)
          ├── DOCX (python-docx)
          └── TXT (UTF-8 / Latin)
```

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios, React Router.
- **Backend**: Python 3.13+, FastAPI, Pydantic v2, Uvicorn, Supabase-py.
- **NLP & Intelligence**:
  - **spaCy** (`en_core_web_sm`): Sentence boundary detection, linguistic tokenization, Named Entity Recognition.
  - **NLTK**: Text preprocessing, stopwords corpus, normalization.
  - **scikit-learn**: TF-IDF vectorization, Cosine Similarity scoring, sentence centrality.
- **Document Processing**: PyMuPDF (fitz), python-docx.
- **Database & Storage**: Supabase PostgreSQL & Supabase Storage.

---

## Features

### 1. Multi-Format Ingestion
- Upload **PDF**, **DOCX**, and **TXT** files (up to 40 MB).
- Automatic text extraction, page counting, and file storage in private Supabase Storage.

### 2. Document Statistics
- Character count, word count, sentence count, paragraph count, and page count.
- Average sentence length, average word length, and estimated reading time.
- Vocabulary richness (Type-Token Ratio / Lexical Diversity).

### 3. TF-IDF Keyword Extraction
- Unigram and bigram statistical term frequency extraction.
- Ranked by term importance scores with visual distribution metrics.

### 4. Named Entity Recognition (NER)
- Categorized extraction of entities: People (`PERSON`), Organizations (`ORG`), Locations (`GPE`/`LOC`), Dates & Times (`DATE`), Money (`MONEY`), Events (`EVENT`), Products (`PRODUCT`), Laws (`LAW`).
- Occurrence frequency counting and category filtering.

### 5. Extractive Summarization
- TF-IDF sentence centrality ranking that selects the most informative sentences without hallucinating new text.
- Interactive length modes: **Short** (~15%), **Medium** (~25%), and **Detailed** (~40%).
- Compression ratio calculation and key sentences breakdown.

### 6. Passage Search
- High-precision passage retrieval using TF-IDF + Cosine Similarity over document chunks.
- Relevance match scoring (0–100%) and chunk index tracking.

### 7. Retrieval-Based Question Answering
- Natural language document Q&A grounded directly in exact document text.
- Returns the direct synthesized answer, verbatim supporting evidence passage, and relevance confidence score.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/documents/upload` | Ingest PDF, DOCX, or TXT file & run NLP pipeline |
| `GET` | `/api/documents` | List all uploaded documents |
| `GET` | `/api/documents/{id}` | Get document metadata |
| `DELETE` | `/api/documents/{id}` | Cascading deletion of document, chunks, analysis, and storage |
| `GET` | `/api/documents/{id}/analysis` | Get complete NLP intelligence analysis |
| `GET` | `/api/documents/{id}/keywords` | Get ranked TF-IDF keywords |
| `GET` | `/api/documents/{id}/entities` | Get categorized Named Entities (spaCy) |
| `GET` | `/api/documents/{id}/summary` | Get extractive summary (`length_mode=short\|medium\|detailed`) |
| `POST` | `/api/documents/{id}/search` | Passage search via TF-IDF + Cosine similarity |
| `POST` | `/api/documents/{id}/question` | Retrieval-based Question Answering |

---

## Local Development Setup

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows Powershell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000/api`
- Interactive Swagger UI: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Web App: `http://localhost:5173`
- Upload Page: `http://localhost:5173/upload`
- Document Library: `http://localhost:5173/dashboard`
- Document Workspace: `http://localhost:5173/documents/:id`

---

## Testing

```bash
cd backend
pytest -v
```

All 32 unit and live integration tests run with mocked and live Supabase clients.
