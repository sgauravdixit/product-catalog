# Product Catalog

Full-stack product catalog app — FastAPI backend + Angular 17 frontend.

## Requirements

- macOS with [Homebrew](https://brew.sh)
- Node.js 18+ (for the frontend)

> **Python 3.14 note:** FastAPI and Pydantic do not yet have stable wheel support for Python 3.14. Use the setup script below to run the backend on Python 3.11.

---

## Backend Setup (Python 3.11)

Run the one-time setup script from the project root:

```bash
bash setup.sh
```

This will:
1. Install Python 3.11 via Homebrew (if not already installed)
2. Create a virtual environment at `backend/.venv`
3. Install all dependencies from `backend/requirements.txt`

### Start the backend

```bash
source backend/.venv/bin/activate
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`.

To verify it's running:

```bash
curl http://localhost:8000/products
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:4200`.

---

## Running Both Together

Open two terminal tabs from the project root:

**Terminal 1 — backend:**
```bash
source backend/.venv/bin/activate
uvicorn backend.main:app --reload
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install   # only needed on first run
npm start
```

Then open `http://localhost:4200` in your browser.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List all products |
| POST | `/products` | Create a product |
| DELETE | `/products/{id}` | Delete a product |

Interactive docs: `http://localhost:8000/docs`

---

## Project Structure

```
product-catalog/
├── backend/
│   ├── main.py            # FastAPI app
│   ├── requirements.txt   # Python dependencies
│   └── .venv/             # Created by setup.sh (git-ignored)
├── frontend/
│   ├── src/
│   └── package.json
├── setup.sh               # One-time backend setup script
└── README.md
```
