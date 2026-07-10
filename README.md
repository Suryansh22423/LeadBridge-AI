# GrowEasy AI CSV Importer

An AI-powered CSV importer that maps **any** lead CSV layout — Facebook Lead Ads exports, Google Ads exports, Excel dumps, real-estate CRM exports, sales reports, or hand-made spreadsheets — into GrowEasy's canonical CRM record format, without assuming fixed column names.

Built for the GrowEasy Software Developer assignment.

## High-Performance Architecture

The importer incorporates advanced production-ready design elements to handle large-scale inputs and provide responsive visual states:

```
┌──────────────┐   parse (client)   ┌────────────────┐   POST /api/import   ┌──────────────────┐
│  CSV Upload  │ ─────────────────▶ │ In-Modal Table  │ ────────────────────▶ │  Express Backend  │
│ (drag/drop)  │   no AI yet        │ (virtual scroll│   creates taskId      │                    │
└──────────────┘                    │  large files)  │                       │  returns 202      │
                                    └────────────────┘                       └──────────────────┘
                                                                                      │
┌──────────────┐   result stats &   ┌────────────────┐     SSE Progress               │ runs in
│  Leads List  │ ◀───────────────── │ Modal Progress │ ◀──────────────────────────────┘ background
│ (local state │   download JSON    │  (exact %)     │     EventSource stream
│  persistent) │                    └────────────────┘
└──────────────┘
```

1. **Upload & Preview** — The user drags or selects a CSV file. It is instantly parsed entirely in the browser (PapaParse) and shown as a preview table inside a beautiful overlay modal.
2. **Spreadsheet Virtualization** — The preview and result tables use virtualized list rendering (`LedgerTable.tsx`). Only the rows within the viewport plus a tiny buffer are mounted, keeping the browser fast even with datasets exceeding thousands of rows.
3. **Background Jobs & SSE Streaming** — Clicking "Confirm Import" posts the CSV and immediately receives a `taskId` (HTTP `202 Accepted`). The backend runs the AI extraction in the background and streams real-time status updates back to the UI over Server-Sent Events (SSE).
4. **Gemini SDK Integration** — Each batch (default 15 rows) is parsed via Gemini (`gemini-2.5-flash`) utilizing a strict JSON schema (`responseSchema`) that guarantees structured outcomes (no free-text parsing). It skips invalid rows (lacking email/phone) and handles exponential retries on transient errors.
5. **CRM Leads Hub** — Mapped leads are saved locally in the browser (`localStorage`) and integrated into a searchable "Manage Leads" dashboard tab matching the GrowEasy layout.

---

## Setup

### Prerequisites
- Node.js 20+
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=AIzaSy...
npm install
npm run dev        # Runs on http://localhost:4000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Defaults to http://localhost:4000
npm install
npm run dev        # Runs on http://localhost:3000
```

---

## Environment Variables

**backend/.env**

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | — | Required (Gemini AI platform API key) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model used for extraction |
| `PORT` | `4000` | Server API Port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin header |
| `AI_BATCH_SIZE` | `15` | Rows sent per extraction request |
| `AI_BATCH_CONCURRENCY` | `3` | Parallel extraction worker processes |

---

## API Endpoints

### `POST /api/import`
- **Payload**: `multipart/form-data` with field `file`.
- **Response**: `202 Accepted`
  ```json
  { "taskId": "550e8400-e29b-41d4-a716-446655440000" }
  ```

### `GET /api/import/progress/:taskId`
- **Response**: `text/event-stream` connection.
- **Events**:
  - `progress`: `{ "type": "progress", "completedBatches": 2, "totalBatches": 5, "percent": 40 }`
  - `complete`: `{ "type": "complete", "result": { ...ImportResult } }`
  - `error`: `{ "type": "error", "error": "Reason" }`

---

## Tests

```bash
cd backend
npm test
```
Runs unit tests for CSV parsing utilities and task queue events.
