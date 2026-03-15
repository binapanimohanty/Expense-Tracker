# Setup & Run Guide

Step-by-step instructions to get the Expense Tracker running on your local machine.

---

## Prerequisites

| Tool       | Version  | Download                                      |
|------------|----------|-----------------------------------------------|
| Python     | 3.10+    | https://www.python.org/downloads/              |
| Node.js    | 18+      | https://nodejs.org/                            |
| PostgreSQL | 14+      | https://www.postgresql.org/download/           |

Make sure `python`, `node`, `npm`, and `psql` are available in your terminal.

---

## 1. Create the PostgreSQL Database

Open a terminal (or pgAdmin) and run:

```sql
CREATE DATABASE expense_tracker;
```

> If you use a custom database name, user, or password, update the `DATABASE_URL` in the `.env` file (Step 2).

---

## 2. Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell)
venv\Scripts\activate
# Windows (CMD)
venv\Scripts\activate.bat
# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Configure Environment Variables

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open the `.env` file and update the values:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker
SECRET_KEY=replace-with-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> **Important:** Change `SECRET_KEY` to a strong random value in production.

### Run the Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will start at **http://localhost:8000**

- Swagger UI: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

> Tables are auto-created on first startup via SQLAlchemy `create_all`.

---

## 3. Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
# Navigate to the frontend folder
cd frontend

# Install Node dependencies
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

The app will start at **http://localhost:5173**

> The Vite dev server is configured to proxy all `/api` requests to the backend at `http://localhost:8000`.

---

## 4. Using the Application

1. Open **http://localhost:5173** in your browser.
2. Click **Sign up** to create a new account.
3. After registration you'll be redirected to the **Dashboard**.
4. Use the sidebar to navigate between:
   - **Dashboard** — overview cards and recent transactions
   - **Transactions** — add, edit, delete, search, and filter transactions
   - **Analytics** — bar chart (monthly income vs expense), pie chart (category breakdown), CSV export

---

## Quick Reference — Running After Initial Setup

Once everything is installed, you only need two commands in separate terminals:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate        # or: source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `psycopg2` install fails | Install PostgreSQL dev headers, or use `psycopg2-binary` (already in requirements) |
| Port 8000 in use | Change port: `uvicorn app.main:app --reload --port 8001` and update `vite.config.js` proxy |
| Port 5173 in use | Vite auto-picks the next port; check terminal output |
| CORS errors | Ensure backend is running and frontend proxy in `vite.config.js` points to the correct port |
| `npm install` peer dep errors | Use `npm install --legacy-peer-deps` |
| Database connection refused | Verify PostgreSQL is running and `DATABASE_URL` in `.env` is correct |
