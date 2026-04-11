# 💰 finance-pure-fe

A fully offline **Angular 21** personal finance dashboard. No backend, no database server — all data lives in JSON files and is managed entirely in the browser.

---

## ✨ Features

- 🔐 Sign in / Sign up with credential validation against `users.json`
- 📊 Dashboard with Remaining / Income / Expenses summary cards — shows all-time data by default
- 📈 Interactive Chart.js charts — Area chart and Spending Pie
- 💳 Full CRUD for Accounts, Categories, and Transactions
- 📥 CSV bulk import for transactions (native FileReader, format: `date,payee,amount`)
- 🗂️ All data reads and writes driven by JSON files (single source of truth)
- 🔒 Auth guard waits for session restore before routing — no redirect on page refresh
- 🌐 Works 100% offline after first load

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── auth/              # Sign-in & Sign-up pages
│   ├── core/
│   │   ├── guards/        # Route protection (auth guard)
│   │   ├── interceptors/  # HTTP interceptors
│   │   └── services/
│   │       ├── auth.service.ts       # Login logic — reads users.json
│   │       ├── filters.service.ts    # URL-based date/account filters
│   │       └── toast.service.ts      # Pop-up notifications
│   ├── features/          # Accounts, Categories, Transactions, Summary logic
│   ├── layout/            # Dashboard shell (sidebar + topbar)
│   ├── pages/             # Home, Transactions, Accounts, Categories, Settings
│   └── shared/
│       ├── components/    # Cards, Charts, Data table, Filters UI
│       └── services/
│           └── finance-data.service.ts  # All CRUD — JSON as source of truth
└── assets/
    └── data/
        ├── users.json         # Registered users & credentials
        ├── accounts.json      # Bank accounts seed data
        ├── categories.json    # Spending categories seed data
        └── transactions.json  # Transactions seed data (all rows shown, no date filter by default)
```

---

## 🔑 Data Architecture

```
assets/data/*.json  ──(HttpClient GET)──►  In-memory cache  ──►  Angular Signals  ──►  UI
                                                │
                                         All CRUD updates
                                         happen here in memory
```

> **Important:** The JSON files are the **single source of truth**. All CRUD operations (create, update, delete) update the in-memory cache and Angular signals so the UI reacts instantly. The session token (userId only) is the only thing stored in `localStorage`.

---

## 🔐 Auth Flow

| Storage | What's kept there |
|---|---|
| `assets/data/users.json` | User records (id, name, email, password) |
| `localStorage` (key: `fin_auth_token`) | userId only — for session persistence |

**Default credentials:**

| Field | Value |
|---|---|
| Email | `abdokhaled@gmail.com` |
| Password | `abdokhaled` |

To add a new user, add an entry to `src/assets/data/users.json`:

```json
{
  "id": "your_user_id",
  "firstName": "First",
  "lastName": "Last",
  "email": "user@example.com",
  "password": "yourpassword",
  "imageUrl": ""
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 — Standalone Components, Signals |
| Styling | Tailwind CSS 3, clsx, tailwind-merge |
| Charts | Chart.js 4 |
| Date handling | date-fns 3 |
| CSV import | Native `FileReader` API |
| Icons | Inline SVG |
| Data storage | JSON files + in-memory signal cache |

---

## 🚀 Getting Started

**Install dependencies:**

```bash
npm install
```

**Run dev server:**

```bash
npm start
# or
npx ng serve
```

Open [http://localhost:4200](http://localhost:4200)

**Build for production:**

```bash
npm run build:prod
```

Output goes to `dist/` — copy it to any static web host (Netlify, Vercel, GitHub Pages, nginx).

---

## 📦 Key Scripts

| Script | Description |
|---|---|
| `npm start` | Dev server on port 4200 |
| `npm run build` | Development build |
| `npm run build:prod` | Production build (output: `dist/`) |
| `npm run watch` | Watch mode for development |

---

## 📋 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Summary cards + charts |
| `/transactions` | Transactions | Full CRUD + CSV import |
| `/accounts` | Accounts | Manage bank accounts |
| `/categories` | Categories | Manage spending categories |
| `/settings` | Settings | App preferences |
| `/sign-in` | Sign In | Login page |
| `/sign-up` | Sign Up | Register page |

---

## 📁 Assets / JSON Files (Do Not Gitignore)

The `src/assets/data/` folder must always be tracked in git — these JSON files are the **core of the entire CRUD system**:

- `users.json` — authentication source
- `accounts.json` — accounts seed
- `categories.json` — categories seed
- `transactions.json` — transactions seed data (loaded in full, no date filter applied by default)

---

## 📝 License

MIT
