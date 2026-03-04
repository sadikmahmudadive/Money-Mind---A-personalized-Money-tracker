# 💰 MoneyMind — Personalized Money Tracker

> A full-featured, AI-powered personal finance tracker built for Bangladeshi users — track income & expenses, set budgets, manage savings goals, and get smart spending insights powered by Groq AI.

---

## ✨ Features

### 💸 Core Tracking
- Income & expense tracking with 20+ categories
- Add, edit, and delete transactions
- Receipt / bill image upload (via Cloudinary)
- Search, filter by type, category & month

### 📊 Dashboard & Analytics
- Live balance card (income / expense / net)
- Monthly bar chart & category pie chart
- Top spending categories with progress bars
- Budget status overview

### 🎯 Budgets
- Set monthly spending limits per category
- Visual progress bars with over-budget highlights
- **Spending alerts** — toast + dashboard card when ≥ 80% spent

### 🔄 Recurring Transactions
- Add monthly bills, salary, subscriptions
- Configurable due-day per item
- **Auto-applied once per month** when you open the app
- **Bill reminders** — dashboard card for items due in next 7 days
- Pause / resume individual items

### 🏦 Savings Goals
- Create goals with target amount, deadline, emoji & color
- Contribution tracking with progress bar
- Deadline countdown ("15 days left")
- 🎉 Celebration state when goal is reached

### 🤖 AI Insights (Groq — free)
- Spending overview & personalised advice
- Month-over-month comparison
- Budget risk analysis
- Savings tips
- Full financial report
- Smart category suggestion while typing transaction titles

### 📤 Import / Export
- **CSV import** — bulk-upload transactions from any spreadsheet
- **CSV export** — download filtered transactions
- **PDF export** — formatted report with jsPDF

### 👤 Profile & Settings
- Display name, avatar (Cloudinary upload)
- Currency preference (BDT default, + USD, EUR, GBP…)
- Dark / light mode toggle

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/sadikmahmudadive/Money-Mind---A-personalized-Money-tracker.git
cd Money-Mind---A-personalized-Money-tracker
npm install
```

### 2. Configure environment
Copy `.env.example` → `.env` and fill in your keys:

```env
# Firebase (required)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Cloudinary (required for image upload)
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...

# Groq AI (optional — free tier)
VITE_GROQ_API_KEY=...
```

#### Firebase Setup
1. [Firebase Console](https://console.firebase.google.com/) → New Project
2. **Authentication** → Sign-in method → Enable **Email/Password** and **Google**
3. **Firestore Database** → Create database (start in test mode)
4. Project Settings → Your apps → **Web app** → copy SDK config to `.env`

#### Cloudinary Setup
1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Settings → Upload → **Add upload preset** → Mode: **Unsigned**
3. Copy **Cloud Name** and preset name to `.env`

#### Groq AI Setup (free)
1. Sign up free at [console.groq.com](https://console.groq.com/keys)
2. Create an API key → copy to `.env` as `VITE_GROQ_API_KEY`

### 3. Run
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── AIWidget.jsx          # Dashboard AI quick-insights card
│   ├── BalanceCard.jsx
│   ├── BudgetCard.jsx
│   ├── CategoryPie.jsx
│   ├── MarkdownText.jsx      # Inline markdown renderer for AI responses
│   ├── MonthlyChart.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   └── TransactionList.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useBudgets.js
│   ├── useRecurring.js       # Recurring transactions + auto-apply
│   ├── useSavingsGoals.js
│   └── useTransactions.js
├── pages/
│   ├── AIInsights.jsx        # 5-tab AI insights page
│   ├── AddTransaction.jsx
│   ├── Auth.jsx
│   ├── BudgetManager.jsx
│   ├── Dashboard.jsx
│   ├── EditTransaction.jsx
│   ├── Landing.jsx
│   ├── Profile.jsx
│   ├── Recurring.jsx
│   ├── Reports.jsx
│   ├── SavingsGoals.jsx
│   └── Transactions.jsx
├── utils/
│   ├── ai.js                 # Groq API (spending insights, tips, etc.)
│   ├── categories.js
│   ├── dateHelpers.js
│   └── formatCurrency.js     # BDT (৳) default formatter
├── firebase.js
├── cloudinary.js
└── App.jsx
```

---

## 🛠️ Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Frontend    | React 18 + Vite 5 + Tailwind CSS 3          |
| Auth & DB   | Firebase Authentication + Firestore         |
| Media       | Cloudinary (unsigned upload)                |
| AI          | Groq API — Llama 3.3 70B (free tier)        |
| Charts      | Recharts                                    |
| Router      | React Router v6                             |
| Export      | jsPDF + jspdf-autotable + PapaParse         |
| Toasts      | react-hot-toast                             |
| Icons       | react-icons (Heroicons)                     |
| Date utils  | date-fns                                    |

---

## 📱 Pages & Routes

| Route          | Page               | Description                            |
|----------------|--------------------|----------------------------------------|
| `/`            | Landing            | Marketing / hero page                  |
| `/auth`        | Auth               | Sign in / Sign up                      |
| `/dashboard`   | Dashboard          | Overview, alerts, recent transactions  |
| `/transactions`| Transactions       | Full list with search, filters, import |
| `/add`         | AddTransaction     | Add income or expense                  |
| `/edit/:id`    | EditTransaction    | Edit an existing transaction           |
| `/budgets`     | BudgetManager      | Monthly budget limits per category     |
| `/recurring`   | Recurring          | Monthly recurring bills & salary       |
| `/goals`       | SavingsGoals       | Savings goal tracker                   |
| `/reports`     | Reports            | Charts + CSV/PDF export                |
| `/ai`          | AIInsights         | 5-tab AI financial analysis            |
| `/profile`     | Profile            | Account settings & preferences         |

---

## 🌐 Firestore Data Model

```
users/{uid}/
├── transactions/{txId}   { type, title, amount, category, date, notes, receiptURL }
├── budgets/{budgetId}    { category, limit }
├── recurring/{recId}     { type, title, amount, category, dueDay, active, lastApplied }
├── goals/{goalId}        { name, targetAmount, savedAmount, deadline, emoji, color }
└── profile/data          { name, email, avatar, currency }
```

---

## 🔒 Security

This app handles sensitive personal financial data. Multiple layers of protection are in place.

### 🔑 API Keys & Secrets
| Secret | Protection |
|---|---|
| Firebase config | Stored in `.env`, excluded from git via `.gitignore` — never committed |
| Groq API key | Stored in `.env`, excluded from git — never committed |
| Cloudinary | Uses **unsigned upload preset** — no server secret is ever exposed to the client |

### 🛡️ Firestore Security Rules (`firestore.rules`)

Production-grade rules are deployed on the database. Every request is validated server-side by Firebase before any data is touched.

**Core principles:**

| Rule | Effect |
|---|---|
| **Authentication required** | Any request without a valid login token is instantly rejected — no anonymous reads |
| **Strict user isolation** | Each user can only access `users/{theirUID}/…` — User A **cannot** read, write, or delete User B's data under any circumstances |
| **Write validation** | Every write is checked server-side: `type` must be `"income"` or `"expense"`, `amount` must be a positive number ≤ 10 crore BDT, all strings have enforced length limits |
| **No wildcard access** | Any Firestore path not explicitly listed in the rules returns `PERMISSION_DENIED` by default |
| **Profile deletion blocked** | Profile documents cannot be deleted directly through the app — only via a proper account deletion flow |

**What the rules protect against:**
- 🚫 Unauthenticated API calls scraping your data
- 🚫 One user reading another user's transactions, budgets, or goals
- 🚫 Malformed or malicious writes (e.g. injecting huge strings, negative amounts, invalid types)
- 🚫 Access to undocumented or future Firestore collections
- 🚫 Even the developer cannot read user data through the app (only via Firebase Console with explicit admin access)

**Rules are version-controlled** in [`firestore.rules`](firestore.rules). To re-deploy after any change:
```bash
# One-time setup
npm install -g firebase-tools
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### 🔐 Authentication
- Firebase Authentication handles all login flows — passwords are **never stored** by the app
- Google Sign-In uses OAuth 2.0 — no passwords involved
- All Firestore listeners are automatically detached on logout

---

## 📄 License

MIT © [Sadik Mahmud Adive](https://github.com/sadikmahmudadive)

MIT © [Sadik Mahmud Adive](https://github.com/sadikmahmudadive)
