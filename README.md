# PhotoVault 📷

> **AI-powered cloud photography portfolio platform** — Upload, discover, and share stunning photography with intelligent search and auto-tagging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 + Tailwind CSS v4 |
| Backend | Node.js + Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Image Storage | Cloudinary |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Future AI | Google Cloud Vision API + Supabase Vector Search |

---

## Project Structure

```
photovault/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/   # Navbar, PhotoCard, PhotoGrid, SearchBar, UploadForm, ProfileHeader
│       ├── pages/        # Home, Login, Register, Upload, PhotoView, Profile, Search
│       ├── context/      # AuthContext (JWT state)
│       ├── services/     # api.js, authService.js, photoService.js
│       ├── layouts/      # MainLayout
│       └── utils/
├── backend/           # Express API
│   ├── controllers/   # auth, photo, like, search, user
│   ├── routes/        # /api/auth /api/photos /api/likes /api/search /api/users
│   ├── models/        # User, Photo, Like, Download
│   ├── middleware/    # auth.js (JWT), errorHandler.js
│   ├── config/        # database.js, cloudinary.js
│   └── server.js
└── shared/
    └── types/         # Shared type definitions and API constants
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd photovault
npm run install:all
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/photovault
JWT_SECRET=your_very_long_random_secret_string_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run Development Servers

```bash
# From the root: runs both frontend and backend concurrently
npm run dev

# Or individually:
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:5000
```

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Sign in |
| GET | `/api/auth/profile` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/photos` | Optional | Get all photos |
| GET | `/api/photos/:id` | Optional | Get photo details |
| POST | `/api/photos/upload` | ✅ | Upload photo (multipart) |
| PUT | `/api/photos/:id` | ✅ | Update photo |
| DELETE | `/api/photos/:id` | ✅ | Delete photo |
| POST | `/api/photos/:id/download` | Optional | Record download |
| POST | `/api/likes/:photoId` | ✅ | Like photo |
| DELETE | `/api/likes/:photoId` | ✅ | Unlike photo |
| GET | `/api/search?q=query` | Optional | Search photos |
| GET | `/api/users/:id` | ❌ | Get user profile |
| GET | `/api/users/:id/photos` | ❌ | Get user's photos |
| GET | `/api/users/:id/stats` | ❌ | Get user stats |
| GET | `/api/health` | ❌ | API health check |

---

## Design System

| Token | Value |
|---|---|
| Primary BG | `#020617` |
| Secondary BG | `#0F172A` |
| Accent | `#6366F1` (Indigo) |
| Highlight | `#F59E0B` (Amber) |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#94A3B8` |
| Heading Font | Poppins |
| Body Font | Inter |

---

## Future AI Integration

- **Google Cloud Vision API** — Auto-generate tags, labels, and descriptions on photo upload
- **Supabase Vector Search** — Store image embeddings for visual similarity search
- **Color palette extraction** — Automated dominant color detection
- **EXIF data parsing** — Camera settings and GPS metadata extraction

---

## Database Setup (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user and copy the connection string
3. Paste it in `backend/.env` as `MONGODB_URI`
4. Whitelist your IP in Atlas Network Access

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret from the dashboard
3. Paste into `backend/.env`
