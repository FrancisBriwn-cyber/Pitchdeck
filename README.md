# PitchDeck — Startup Idea Validation Platform

A fullstack platform where founders and builders can post startup ideas, get structured community feedback, and discover what problems others are trying to solve.

---

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | _Add Vercel URL after deployment_ |
| Backend  | _Add Render URL after deployment_ |

---

## Database Schema

### Tables

**users**
| Column        | Type         | Notes                          |
|---------------|--------------|--------------------------------|
| id            | SERIAL PK    |                                |
| name          | VARCHAR(100) | NOT NULL                       |
| email         | VARCHAR(255) | UNIQUE NOT NULL                |
| password_hash | TEXT         | NULL for Google-only accounts  |
| google_id     | VARCHAR(100) |                                |
| created_at    | TIMESTAMPTZ  | DEFAULT NOW()                  |

**pitches**
| Column          | Type         | Notes                     |
|-----------------|--------------|---------------------------|
| id              | SERIAL PK    |                           |
| user_id         | INTEGER FK   | → users(id) CASCADE       |
| name            | VARCHAR(150) | NOT NULL                  |
| one_liner       | VARCHAR(300) | NOT NULL                  |
| problem         | TEXT         | NOT NULL                  |
| solution        | TEXT         | NOT NULL                  |
| target_market   | VARCHAR(255) | NOT NULL                  |
| cover_image_url | TEXT         | Cloudinary URL (optional) |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW()             |
| updated_at      | TIMESTAMPTZ  | DEFAULT NOW()             |

**feedback**
| Column       | Type        | Notes                     |
|--------------|-------------|---------------------------|
| id           | SERIAL PK   |                           |
| pitch_id     | INTEGER FK  | → pitches(id) CASCADE     |
| user_id      | INTEGER FK  | → users(id) CASCADE       |
| what_i_like  | TEXT        | NOT NULL                  |
| would_change | TEXT        | NOT NULL                  |
| would_use    | BOOLEAN     | NOT NULL                  |
| created_at   | TIMESTAMPTZ | DEFAULT NOW()             |
|              |             | UNIQUE(pitch_id, user_id) |

Relationships:
- A **user** has many **pitches**
- A **pitch** has many **feedback** entries
- A **user** has many **feedback** entries (but not on their own pitches)

---

## API Endpoints

| Method | Path                          | Auth | Description                          |
|--------|-------------------------------|------|--------------------------------------|
| POST   | /api/auth/register            | No   | Register new user                    |
| POST   | /api/auth/login               | No   | Login, returns JWT                   |
| GET    | /api/auth/google              | No   | Initiate Google OAuth                |
| GET    | /api/auth/google/callback     | No   | Google OAuth callback                |
| GET    | /api/pitches                  | No   | Get all pitches (newest first)       |
| GET    | /api/pitches/search?q=keyword | No   | Search pitches by keyword            |
| GET    | /api/pitches/:id              | No   | Get single pitch with feedback       |
| POST   | /api/pitches                  | Yes  | Create a new pitch                   |
| PUT    | /api/pitches/:id              | Yes  | Edit a pitch (owner only)            |
| DELETE | /api/pitches/:id              | Yes  | Delete a pitch (owner only)          |
| POST   | /api/pitches/:id/feedback     | Yes  | Submit feedback (no self-feedback)   |
| GET    | /api/users/:id                | No   | Get user profile and their pitches   |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth credentials

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd pitchdeck
```

### 2. Set up the database

Run the schema against your Supabase database (SQL Editor tab):

```bash
# Copy contents of backend/db/schema.sql and run in Supabase SQL Editor
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=a_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
cp frontend/.env.example frontend/.env
# VITE_API_URL=http://localhost:5000
```

### 4. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run the app

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Seeding the Database

```bash
# From project root (after filling in backend/.env)
node seed.js
```

This inserts:
- 3 fictional user accounts (all with password `Seed@1234`)
- 10 pitches across fintech, agritech, edtech, healthtech, logistics, and more
- 20 feedback entries (2 per pitch, from non-owners)

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** → `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all `.env` variables in the **Environment** tab
7. Update `GOOGLE_CALLBACK_URL` to your Render URL: `https://your-app.onrender.com/api/auth/google/callback`

### Frontend → Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Add environment variable: `VITE_API_URL=https://your-app.onrender.com`
4. Update Google Cloud Console → Authorised redirect URIs to include the Render callback URL
5. Update backend CORS `CLIENT_URL` env var to your Vercel domain

---

## Known Limitations

- Full-text search uses PostgreSQL `to_tsvector` — very short (1-2 character) queries may return no results.
- Google OAuth requires the backend to be deployed (localhost OAuth flows require manual Google Console config).
- Image upload is limited to 5 MB per file.
- Each user can only submit one feedback entry per pitch.
