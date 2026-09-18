# ApexFinance — Personal Finance & Portfolio Tracker

A modern, full-stack personal finance and investment tracking application built according to the **Antigravity Specification**.

---

## 🚀 Features

- **Dashboard**:
  - Monthly income, expenses, and net balance summary.
  - Expense category breakdown with interactive donut charts.
  - 6-month historical cash flow trend (Income vs. Expenses) with bar charts.
  - Live stock portfolio summary (total value, total cost, all-time P&L, top holdings).
  - Upcoming recurring bills (due in the next 30 days).
  - Live recent transactions stream.
- **Income Management** (`/income`):
  - CRUD operations for income streams (Salary, Freelance, Dividends, etc.).
  - Date range filters and category filters.
  - Real-time sum calculation for filtered records.
- **Expense Management** (`/expenses`):
  - Categorized expense tracking (Rent, Food, Transport, Subscriptions, Utilities, Health, Entertainment, Misc).
  - Subcategory tags and search filter.
  - Date range filtering and instant total expense calculation.
- **Subscription Tracking** (`/subscriptions`):
  - Recurring payment management with Monthly and Yearly billing cycles.
  - Next billing date tracking and countdown tags.
  - 30-day renewal filter and monthly burn rate equivalent calculation.
- **Stock Portfolio** (`/portfolio`):
  - Track ticker holdings, shares owned, and average purchase price.
  - System-managed daily closing prices (`stock_prices` table).
  - Automatic calculation of:
    - Current Market Price
    - Invested Value
    - Current Market Value
    - Unrealized Profit / Loss ($)
    - Return on Investment (%)
  - One-click **Sync Market Prices** action (Alpha Vantage / Yahoo Finance / deterministic market engine fallback).
- **Multi-User Ready Architecture**:
  - All database models are scoped by `user_id`.
  - Seamless support for session-based auth / JWT.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Dark mode UI)
- **Database & ORM**: Prisma ORM with SQLite for zero-config local development, fully compatible with PostgreSQL (Supabase, Neon, Railway)
- **Data Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 🏁 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Database Setup & Seeding

```bash
# Push schema to local SQLite database
npx prisma db push

# Populate with realistic demo data (incomes, expenses, subscriptions, stocks, prices)
npx prisma db seed
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ PostgreSQL Production Setup

To connect to a production PostgreSQL database (e.g. Supabase, Neon, Railway):

1. Change the provider in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env` with your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
   ```
3. Run `npx prisma db push` or `npx prisma migrate dev`.

---

## 🔌 API Endpoints

- `GET /api/dashboard` — Unified dashboard metrics, charts data, and portfolio overview
- `GET /api/income` & `POST /api/income` — List (filtered) and create income
- `PUT /api/income/[id]` & `DELETE /api/income/[id]` — Edit and remove income
- `GET /api/expenses` & `POST /api/expenses` — List (filtered) and create expenses
- `PUT /api/expenses/[id]` & `DELETE /api/expenses/[id]` — Edit and remove expenses
- `GET /api/subscriptions` & `POST /api/subscriptions` — List and create recurring subscriptions
- `PUT /api/subscriptions/[id]` & `DELETE /api/subscriptions/[id]` — Edit and remove subscriptions
- `GET /api/stocks` & `POST /api/stocks` — List portfolio with computed P&L and add stock
- `PUT /api/stocks/[id]` & `DELETE /api/stocks/[id]` — Edit and remove stock holding
- `POST /api/stocks/sync` — Daily closing prices updater for all distinct tickers

---

## 💻 Global Status Line Configuration

Custom status line scripts have been placed in `C:\Users\Sanatiel\.antigravity\`:

- `C:\Users\Sanatiel\.antigravity\statusline.ps1` (PowerShell for Windows)
- `C:\Users\Sanatiel\.antigravity\statusline.sh` (Bash for macOS / Linux)

### Metrics & Colors:
1. 📁 **Working Directory / Project Name** (`Cyan`)
2.  **Git Branch** (`Magenta`)
3. 🤖 **Model Name** (`Yellow`)
4. 📊 **Progress Bar** (`Dynamic Green / Yellow / Red`)
5. ⚡ **Context Usage %** (`Green`)
6. 🎯 **Tokens Used** (`Ice Blue`)
