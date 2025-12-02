# Vantage Finance Tracker (Frontend)

A modern finance tracker web app featuring transaction management, recurring expenses, savings goals, and a Redux-powered user system.  
Built with **React + TypeScript + Vite**, backed by a **Rails API** and **PostgreSQL**.

---

## ✨ What this app does

### 💳 Transactions
- Create, edit, delete income/expense transactions
- Categories, notes, metadata support
- Bulk delete
- Dashboard summary (income, expense, balance)
- Filters (type, category, date range) + sorting
- Optimistic UI updates for smooth UX

### 🔁 Recurring Transactions
- Create recurring income/expense rules
- Upcoming recurring preview
- Pause/resume recurring flows
- Processing endpoint support (backend TODO/partial)

### 🎯 Savings Goals
- Create and manage multiple savings goals
- Add money to goals via quick modal
- Progress bars + reached/overdue states
- Summary cards (total target, saved, remaining, progress)
- Dashboard card integrated with real goals data
- RTK Query caching + optimistic updates

### 🔐 User Management System (Redux Powered)
- Login/logout with Redux auth slice
- Registration with validation
- Forgot password flow (simulated)
- Auto token refresh + session timeout handling
- Protected routes using `ProtectedRoute`
- Profile management:
  - personal info (name, phone, DOB)
  - preferences (theme, currency, language)
  - privacy + notification settings
  - password change with verification

### 🎨 UX Details
- Dark theme across the app
- Real-time form validation with error feedback
- Loading/empty states
- Toast success/error feedback
- Fully responsive (mobile → desktop)
- Smooth transitions and animations

---

## 🧰 Tech Stack
- **Frontend:** React + TypeScript + Vite
- **State/Data:** Redux Toolkit + RTK Query
- **Backend:** Ruby on Rails REST API
- **Database:** PostgreSQL
- **Auth:** JWT (mock in frontend, backend-ready)
- **Styling/UI:** Tailwind CSS + reusable UI components

---

## 📁 Project Structure

```txt
src/
├── components/
│   ├── ui/                   # Button, Input, Card, etc.
│   ├── layout/               # Sidebar, shared layouts
│   ├── savingsGoals/         # Goal modals + feature components
│   └── ProtectedRoute.tsx    # Route protection
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useRecurringTransactions.ts
│   └── useSavingsGoals.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ProfilePage.tsx
│   ├── dashboard/
│   └── savingsGoals/
├── services/
│   └── api.ts                # Mock API service layer
├── store/
│   ├── api/                  # baseApi + feature APIs
│   ├── slices/               # authSlice, transactionSlice
│   └── index.ts              # store config
├── types/
│   ├── auth.ts
│   ├── savingsGoal.ts
│   └── index.ts
├── App.tsx
└── main.tsx

Getting Started (Local Setup)
Prerequisites

Node.js >= 18

Rails backend running locally (recommended)

PostgreSQL configured for backend

Installation

Clone the repo

git clone https://github.com/Soni0709/vantage_frontend.git
cd vantage_frontend


Install dependencies

npm install


Create .env

VITE_API_BASE_URL=http://localhost:3000/api/v1


Start dev server

npm run dev


App runs at: http://localhost:5173

📜 Scripts
npm run dev       # Start dev server (HMR)
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # ESLint checks

🧭 Routes

Public:

/ → Landing Page

/login → Login

/register → Sign up

/forgot-password → Reset password

Protected:

/profile → Profile management

/dashboard → Main dashboard

/savings-goals → Savings Goals page

🏗️ Architecture (High Level)
Layers

UI Layer
Pages, lists, modals, filters

Custom Hooks Layer
Business logic wrappers
useTransactions, useRecurringTransactions, useSavingsGoals, useAuth

RTK Query Layer
Query + mutations with caching, invalidation & optimistic updates

Redux Store
authSlice, transactionSlice, RTK Query API cache

Rails API Backend
REST endpoints for transactions, recurring transactions, savings goals

PostgreSQL DB
transactions, recurring_transactions, savings_goals

🔄 Data Flow (Examples)
Read Flow (GET Transactions)
UI → useTransactions() → useGetTransactionsQuery()
  → Cache hit ✅ or API call → Rails → Postgres
  → Response → Redux Cache → UI refresh ✅

Write Flow (CREATE/UPDATE/DELETE)
UI action → RTK Mutation Hook
  → Optimistic UI update ⚡
  → API request → Backend save
  → Success: invalidate + refetch summary
  → Error: rollback optimistic update

🔐 Authentication Flow (JWT)

Login returns { token, user }

Stored in Redux + localStorage (vantage_token)

Requests auto-attach token

Refresh runs before expiry

Refresh fail → redirect to /login

____________________________________________________________________________________________________________________________

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
