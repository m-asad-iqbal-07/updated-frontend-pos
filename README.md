# Philo Coffee Shop — POS System

A full-featured **Point of Sale** web application for Philo Coffee Shop. Built with **React + Vite + TypeScript** on the frontend and **FastAPI + SQLite** on the backend.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI summary, revenue charts, top items, payment breakdown, inventory alerts |
| **POS Register** | Menu browsing, cart, add-ons, customer/discount selection, order placement |
| **Orders** | Paginated order list with status filters, order detail view, status updates |
| **Menu Management** | Full CRUD for Categories, Menu Items, and Add-ons |
| **Customers** | Full CRUD for customers with per-customer order history |
| **Discounts** | Full CRUD for percentage and flat-rate discounts |
| **Shifts** | Open/close cashier shifts, shift revenue & expense summary |
| **Expenses** | Record and manage business expenses by category |

---

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TanStack Query, Axios, Lucide Icons
- **Backend:** FastAPI, SQLAlchemy, SQLite, Alembic (migrations)
- **Styling:** Vanilla CSS with CSS custom properties (themes)

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd pos-b

# Install dependencies (requires Python 3.12+ and uv)
uv sync

# Run database migrations
uv run alembic upgrade head

# Start the server
uv run python main.py
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd pos-task-philo

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Start the dev server
npm run dev
# → App running at http://localhost:5173 (or 5174 if busy)
```

---

## ⚙️ Configuration

### API URL

Set the API URL in `pos-task-philo/.env`:

```env
# Local backend (default)
VITE_API_URL=http://localhost:8000/api/v1

# Railway deployment (uncomment to switch)
# VITE_API_URL=https://philo-coffee-shop-production-dd93.up.railway.app/api/v1
```

### Backend CORS

Add your frontend URL to `pos-b/.env`:

```env
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174"]
```

---

## 📁 Project Structure

```
pos-task-philo/src/
├── pages/          # Route pages
├── components/     # Reusable UI components
│   ├── layout/     # AppLayout, Sidebar (mobile drawer), PageHeader
│   ├── dashboard/  # Charts
│   ├── orders/     # Order detail modal
│   ├── pos/        # Menu grid, cart sidebar, add-on modal
│   └── ui/         # Badge, Button, Card, Spinner, ErrorState
├── hooks/          # Data fetching hooks (TanStack Query)
│   ├── useDashboard.ts
│   ├── useOrders.ts
│   ├── usePOS.ts
│   ├── useMenu.ts       ← Categories, Items, Add-ons CRUD
│   ├── useCustomers.ts  ← Customers CRUD + order history
│   ├── useDiscounts.ts  ← Discounts CRUD
│   ├── useShifts.ts     ← Open/close shifts
│   └── useExpenses.ts   ← Expenses CRUD
├── context/        # CartContext, DateFilterContext
├── lib/            # api.ts (Axios client + TypeScript interfaces), utils.ts
└── styles/         # CSS files per module
```

---

## ⚠️ Known Limitations

| API Endpoint | Status | Note |
|---|---|---|
| `GET /api/v1/dashboard/profit-loss` | ⏳ Planned | Not yet shown in dashboard |
| `GET /api/v1/dashboard/shift-summary` | ⏳ Planned | Not yet shown in dashboard |
| `GET /api/v1/dashboard/customer-insights` | ⏳ Planned | Not yet shown in dashboard |
| `DELETE /api/v1/orders/{id}` | ➖ Skipped | Status updates implemented instead |

All other APIs are **fully integrated**.

---

## 📖 API Documentation

With the backend running, visit: **http://localhost:8000/docs**

---

## 📋 Development Commands

```bash
# Frontend
npm run dev       # Start dev server
npm run build     # Production build
npm test          # Run tests

# Backend
uv run python main.py         # Start server
uv run alembic upgrade head   # Run migrations
```
