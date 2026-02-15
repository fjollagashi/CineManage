# CineManage

A full-stack web app for cinemas to manage movies, show schedules, ticket sales, and customer feedback. Customers browse movies, book tickets with seat selection, and leave reviews. Admins and employees manage content and bookings.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Prisma (SQLite)
- **Auth:** JWT
- **Payments:** Stripe (optional; works in demo mode without keys)

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (DATABASE_URL, JWT_SECRET, optional STRIPE_*)
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at **http://localhost:4000**.

**Seed admin:** `admin@cinemanage.com` / `admin123`

### 2. Frontend

```bash
cd frontend
# Optional: create .env with VITE_STRIPE_PK=pk_test_... for Stripe
npm install
npm run dev
```

App runs at **http://localhost:5173**.

## Features

### Customers
- Browse movies, view details and showtimes
- Select seats (standard/VIP) and book tickets
- Pay with Stripe or confirm in demo mode (no Stripe key)
- QR code on confirmation for entry
- Cancel/refund up to 2 hours before showtime
- View booking history
- Rate and review movies

### Employees
- View and manage bookings
- Access sales reports (daily/weekly/monthly)

### Admins
- **Movies:** Add, edit, delete (title, genre, duration, rating, director, actors, description, poster, trailer)
- **Shows:** Schedule shows (date, time, standard/VIP price, screen hall); default 5×8 seat layout per show
- **Bookings:** List all bookings
- **Reviews:** Approve or hide customer reviews
- **Promotions:** Create discount codes (percent or fixed)
- **Employees:** Create employee accounts
- **Analytics:** Dashboard (revenue today, bookings today, top movies), sales and refund reports

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (customer by default) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (auth) |
| GET | `/api/movies` | List movies (query: genre, search, active) |
| GET | `/api/movies/:id` | Movie detail + approved reviews |
| POST | `/api/movies` | Create movie (admin) |
| PATCH | `/api/movies/:id` | Update movie (admin) |
| DELETE | `/api/movies/:id` | Delete movie (admin) |
| GET | `/api/shows` | List shows (query: movieId, from, to) |
| GET | `/api/shows/:id` | Show + seats |
| POST | `/api/shows` | Create show (admin) |
| POST | `/api/bookings` | Create booking (customer); returns clientSecret if Stripe |
| POST | `/api/bookings/:id/confirm` | Confirm payment (customer) |
| POST | `/api/bookings/:id/refund` | Refund (customer/employee/admin) |
| GET | `/api/bookings` | My bookings or all (role) |
| PUT | `/api/reviews/movie/:movieId` | Submit review (customer) |
| GET | `/api/analytics/dashboard` | Dashboard stats (admin) |
| GET | `/api/analytics/sales?period=day\|week\|month` | Sales report (admin/employee) |
| GET | `/api/admin/employees` | List employees (admin) |
| POST | `/api/admin/employees` | Create employee (admin) |
| GET/POST | `/api/admin/promotions` | List/create promotions (admin) |

## Environment

**Backend (`.env`):**
- `DATABASE_URL` – Prisma DB URL (e.g. `file:./dev.db`)
- `JWT_SECRET` – Secret for JWT signing
- `JWT_EXPIRE` – Token expiry (e.g. `7d`)
- `PORT` – Server port (default 4000)
- `FRONTEND_URL` – CORS origin (e.g. `http://localhost:5173`)
- `STRIPE_SECRET_KEY` – Optional; omit for demo (confirm without payment)
- `STRIPE_WEBHOOK_SECRET` – Optional for webhooks

**Frontend (`.env`):**
- `VITE_STRIPE_PK` – Optional; Stripe publishable key for payment form

## Project Structure

```
CineManage/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── index.js
│       ├── lib/prisma.js
│       ├── middleware/auth.js
│       └── routes/ (auth, movies, shows, bookings, reviews, analytics, admin)
├── frontend/
│   └── src/
│       ├── api.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       ├── pages/
│       └── pages/admin/
└── README.md
```

## License

MIT
