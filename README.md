# MoneyMind — Personalized Money Tracker

## 🚀 Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Firebase + Cloudinary
Copy `.env.example` → `.env` and fill in your credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/) → New Project
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Firestore Database** (start in test mode)
4. Copy SDK config to `.env`

#### Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Settings → Upload → **Add upload preset** → Set to **Unsigned**
3. Copy `Cloud Name` + preset name to `.env`

### 3. Run
```bash
npm run dev        # Development
npm run build      # Production build
npm run preview    # Preview build
```

---

## 🗂️ Project Structure

```
src/
├── context/        AuthContext, ThemeContext
├── hooks/          useTransactions, useBudgets
├── utils/          categories, formatCurrency, dateHelpers
├── components/     Navbar, Sidebar, Charts, Cards…
├── pages/          Landing, Auth, Dashboard, Transactions,
│                   AddTransaction, BudgetManager, Reports, Profile
├── firebase.js     Firebase init
└── cloudinary.js   Cloudinary uploader
```

## 🛠️ Tech Stack
| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Auth + DB | Firebase Auth + Firestore           |
| Media     | Cloudinary                          |
| Charts    | Recharts                            |
| Router    | React Router v6                     |
| Export    | jsPDF + PapaParse                   |

## ✨ Features
- 🔐 Email/Password + Google Sign-In
- 💸 Income & Expense tracking with categories
- 📎 Receipt/bill image upload via Cloudinary
- 📊 Dashboard with balance card, bar charts, pie charts
- 🎯 Budget manager with progress bars & alerts
- 📈 Reports page with line chart + CSV/PDF export
- 🌙 Dark mode toggle
- 💱 Multi-currency support (INR, USD, EUR, GBP …)
- 👤 Profile settings with Cloudinary avatar upload
