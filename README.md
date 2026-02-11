# ProSafe Work Management System

A comprehensive work management platform with task tracking, project management, team collaboration, and analytics.

## Prerequisites

- **Node.js** v14+
- **PostgreSQL** v12+
- **npm** or **yarn**

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd prosafe-work-management
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=prosafe_work_management
NODE_ENV=development
JWT_SECRET=your-secret-key
```

Create the PostgreSQL database:

```sql
CREATE DATABASE prosafe_work_management;
```

Run the database migration:

```bash
node run-migration.js
```

Start the backend server:

```bash
npm start        # production
npm run dev      # development (with hot reload)
```

The backend will be available at **http://localhost:5000**.

### 3. Frontend Setup

From the project root:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at **http://localhost:8080**.

## Test Accounts

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | john@prosafe.com   | password123 |
| Manager | jane@prosafe.com   | password123 |
| User    | mike@prosafe.com   | password123 |

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React, Vite, Tailwind CSS, React DnD    |
| Backend  | Node.js, Express                        |
| Database | PostgreSQL                              |
| Auth     | JWT, bcryptjs                           |
| Charts   | Recharts                                |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, permissions, validation
│   ├── routes/           # API endpoints
│   ├── migrations/       # Database schema
│   └── server.js         # Entry point
│
├── frontend/
│   └── src/
│       ├── pages/        # Page components
│       ├── components/   # Reusable components
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API service layer
│       └── utils/        # Helper functions
│
├── vite.config.js        # Vite configuration
└── tailwind.config.ts    # Tailwind configuration
```

## Troubleshooting

- **Backend won't start** — Verify PostgreSQL is running and `.env` credentials are correct.
- **Frontend shows network errors** — Ensure the backend is running on port 5000.
- **Database errors** — Run `node run-migration.js` in the `backend/` directory.
