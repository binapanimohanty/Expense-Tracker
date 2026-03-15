# Expense Tracker — Full Stack Application

A production-ready expense tracking web application built with **React + Vite + Tailwind CSS** on the frontend and **FastAPI + PostgreSQL** on the backend.

## Features

- JWT Authentication (register / login)
- CRUD transactions with categories and date filtering
- Dashboard with income, expense, and balance summary cards
- Analytics page with interactive Recharts (bar + pie charts)
- CSV report export
- Pagination, search, dark mode, category color tagging
- Responsive sidebar layout

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** running locally (or a remote connection string)

---

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux

# Edit .env and set your PostgreSQL connection string and a strong SECRET_KEY
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/expense_tracker
# SECRET_KEY=some-random-long-secret
```

### Create the database

```sql
-- In psql or pgAdmin:
CREATE DATABASE expense_tracker;
```

### Run the backend

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be running at **http://localhost:8000**.  
Swagger docs at **http://localhost:8000/docs**.

---

## Frontend Setup

```bash
cd frontend

# Install dependencies (use --legacy-peer-deps due to Vite 8 + Tailwind plugin)
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

The frontend will run at **http://localhost:5173**.  
The Vite dev server proxies `/api` requests to the FastAPI backend on port 8000.

---

## Project Structure

```
Expense-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── auth.py              # JWT utilities + get_current_user
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   └── transaction.py   # Transaction model
│   │   ├── schemas/
│   │   │   ├── user.py          # Pydantic schemas for auth
│   │   │   └── transaction.py   # Pydantic schemas for transactions
│   │   ├── services/
│   │   │   ├── auth_service.py  # Register / login logic
│   │   │   └── transaction_service.py  # CRUD + analytics queries
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── transaction_router.py
│   │       ├── analytics_router.py
│   │       └── report_router.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── AppLayout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── TransactionModal.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── TransactionsPage.jsx
    │   │   └── AnalyticsPage.jsx
    │   └── utils/
    │       ├── constants.js
    │       └── helpers.js
    ├── package.json
    └── vite.config.js
```

---

## API Endpoints

| Method | Endpoint                       | Auth | Description                |
|--------|--------------------------------|------|----------------------------|
| POST   | `/api/auth/register`           | No   | Register a new user        |
| POST   | `/api/auth/login`              | No   | Login and get JWT token    |
| GET    | `/api/transactions`            | Yes  | List transactions (paginated, filterable) |
| POST   | `/api/transactions`            | Yes  | Create a transaction       |
| PUT    | `/api/transactions/{id}`       | Yes  | Update a transaction       |
| DELETE | `/api/transactions/{id}`       | Yes  | Delete a transaction       |
| GET    | `/api/analytics/monthly-summary` | Yes | Monthly income vs expense  |
| GET    | `/api/analytics/category-summary` | Yes | Expenses grouped by category |
| GET    | `/api/report/export`           | Yes  | Export transactions as CSV |
