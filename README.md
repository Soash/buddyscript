# BuddyScript

A full-stack social platform built using **React + Django REST Framework**, focused on **system design, scalability, and AI-assisted development**.

---

## 🚀 Tech Stack

* **Backend**: Django REST Framework (JWT Authentication)
* **Frontend**: React (Vite) + Redux Toolkit
* **Database**: SQLite (default for local dev) / PostgreSQL (production via `DATABASE_URL`)
* **Hosting**: DigitalOcean VM

---

## 🌐 Live Demo

* **Live App**: [http://139.59.3.116/](http://139.59.3.116/)
* **Demo Video**: [https://www.youtube.com/watch?v=xXNGglxiZgI](https://www.youtube.com/watch?v=xXNGglxiZgI)

---

## 🚢 Deployment (DigitalOcean)

This project is hosted on a **DigitalOcean VM**. Below is a typical, production-style setup that matches this repo’s backend configuration (Gunicorn + WhiteNoise).

### Backend (Django API)

**One common approach**

* Run the API using **Gunicorn** (installed in `backend/requirements.txt`).
* Serve **static files** via **WhiteNoise** (enabled when `DJANGO_DEBUG=0`).
* Serve **media uploads** (e.g., profile photos, post images) from disk (often via Nginx).

**Example commands**

```bash
cd backend
pip install -r requirements.txt

# Ensure env vars exist in backend/.env
python manage.py migrate
python manage.py collectstatic --noinput

gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (React SPA)

**One common approach**

* Build the SPA with Vite (`npm run build`).
* Serve the generated `dist/` via **Nginx**.
* Reverse-proxy API requests (e.g. `/api/`) to Gunicorn.

**Example commands**

```bash
cd buddyscript-ui
npm install
npm run build
```

### Nginx (high-level)

Typical routing for a single-domain deployment:

* `/` → serves the React app (`index.html` + static assets)
* `/api/` → proxies to the Django API (Gunicorn)
* `/media/` → serves Django media uploads

> Note: Exact Nginx + systemd configs depend on your server layout, domain, and TLS.

### Recommended production env vars (backend/.env)

Minimum set for a safe-ish production configuration:

* `DJANGO_DEBUG=0`
* `DJANGO_SECRET_KEY=<long-random-secret>`
* `DJANGO_ALLOWED_HOSTS=<your-domain-or-ip>`
* `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME`
* `CORS_ALLOW_ALL_ORIGINS=0`
* `CORS_ALLOWED_ORIGINS=https://your-frontend-domain`
* `DJANGO_CSRF_TRUSTED_ORIGINS=https://your-frontend-domain`

Optional (behind a TLS-terminating proxy):

* `DJANGO_SECURE_SSL_REDIRECT=1`

---

## 🧠 System Design Overview

BuddyScript follows a **SPA + REST API architecture**:

* React frontend communicates with Django REST API via JWT
* Backend is modularized into apps: `users`, `feed`, `events`
* Relational DB: SQLite in dev by default, PostgreSQL in production
* Media: stored on local disk via Django `MEDIA_ROOT` (can be migrated to S3-compatible storage)

**Core Flow:**

```
User → React UI → Axios → DRF API → Database (SQLite/PostgreSQL) → Response → UI Update
```

---

## ✨ Features

### 🔐 Authentication & Authorization

* JWT-based authentication (access + refresh tokens)
* Protected routes and APIs
* Object-level permission enforcement

---

### 👤 User System

* Profile management (name, bio, role, photo)
* Follow / Unfollow
* Friend requests (send, accept, decline, cancel)
* Friends system

---

### 🧵 Feed System

* Create posts (text + images)
* Public / Private visibility
* Comments and replies
* Multi-reactions (`like`, `love`, `haha`)
* Infinite scroll with pagination

---

### 🤝 Social Discovery

* Suggested users
* “You Might Like” system (dynamic refresh)
* Searchable user directory

---

### 📅 Events System

* Create / edit / delete events
* RSVP (`going`, `interested`)
* Basic search

---

## ⚡ Feature Highlights

* **Connections Hub** with deep linking:

  * `/connections#friend-request`
  * `/connections#send-request`
  * `/connections#following`

* **Optimized Feed**

  * Pagination + infinite scroll
  * No full dataset loading

* **Smart Suggestions**

  * Avoids repetition using `exclude_id`

* **Real-time UI feel**

  * State updates without page refresh

---

## 🏗️ Architecture

### Frontend Structure

* Pages → `src/pages/`
* Components → `src/components/`
* API → centralized Axios client
* State → Redux Toolkit slices

### State Management

* Global: Redux Toolkit (`createAsyncThunk`)
* Local: React `useState`

### Performance Optimization

* `useMemo` for derived data
* Scoped updates (avoid full re-fetch)
* Backend pagination

---

## 🔐 Security Considerations

### Current Implementation

* JWT stored in `localStorage`
* Sent via `Authorization: Bearer <token>`

### Tradeoffs

* Simple and fast
* Vulnerable to XSS if not mitigated

### Production Improvements

* HttpOnly + Secure cookies for refresh tokens
* Short-lived access tokens
* CSP and input sanitization

### CSRF / XSS

* CSRF risk is low in the current design because JWTs are sent via `Authorization` header (not automatically by the browser like cookies)
* XSS is the primary risk (because access tokens live in `localStorage`)

---

## 📈 Scaling Strategy

* DB indexing
* Migrate media to object storage + CDN
* Redis caching
* Background jobs (Celery / RQ)
* Full-text search (Postgres)

---

## ⚖️ Key Engineering Tradeoffs

* Used `localStorage` for JWT for simplicity
* Built additional features (events, social graph) to demonstrate system design
* Prioritized backend robustness over UI polish

---

## 🔮 Future Improvements

* HttpOnly cookie-based authentication
* Redis caching layer
* Query optimization (`select_related`, `prefetch_related`)
* WebSockets for real-time updates
* Better frontend abstraction

---

## 🤖 AI Development Workflow

Used **Gemini 3.1 Pro** and **GPT-5.2** as development partners.

### AI Usage

* Codebase navigation
* Feature implementation
* Debugging and validation

### Prompting Strategy

* “Find exact file responsible for X”
* “Make minimal patch for Y”
* “Verify build after changes”

### Validation

* Manual code review
* `npm run build`
* Django checks

### Handling AI Errors

* Refined prompts with precision
* Verified actual code paths
* Iterated until correct behavior

---

## ⚙️ Setup Instructions

### Prerequisites

* Python 3.11+
* Node.js 18+

---

### Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### Frontend

```bash
cd buddyscript-ui
npm install
npm run dev
```

---

## 🔑 Environment

### Backend

Create `backend/.env` (same folder as `manage.py`) and set:

* `DJANGO_DEBUG=0`
* `DJANGO_ALLOWED_HOSTS`
* `DJANGO_SECRET_KEY`
* `DATABASE_URL`
* `CORS_ALLOW_ALL_ORIGINS=0` (recommended for production)
* `CORS_ALLOWED_ORIGINS` (recommended for production)
* `DJANGO_CSRF_TRUSTED_ORIGINS` (recommended for production)

### Frontend

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

---

## 📡 Authentication Header

```
Authorization: Bearer <access_token>
```

---

## 📦 Repository Structure

```
backend/         → Django API
buddyscript-ui/  → React frontend
```

---

# 📚 API Reference (Backend)

## Auth (JWT)

* POST /api/auth/login/ — obtain JWT tokens.
  Body: { "email": "...", "password": "..." }

* POST /api/auth/login/refresh/ — refresh access token.
  Body: { "refresh": "..." }

* POST /api/auth/register/ — create a new user.
  Body: { "email": "...", "password": "...", "first_name": "...", "last_name": "..." }

---

## Users (Profiles + Relationships)

* GET /api/users/me/ — get your profile
* PATCH /api/users/me/ — update profile

Fields:
first_name, last_name, bio, role, profile_photo

* GET /api/users/<id>/ — get user profile

* GET /api/users/suggested/ — suggested users

* GET /api/users/you-might-like/ — one suggestion
  Query: ?exclude_id=<id>

* GET /api/users/directory/ — searchable user list
  Query: ?q=<search>
  Pagination: ?page, ?page_size

Response includes:
is_friend, is_following, incoming_request_id, outgoing_request_id

* POST /api/users/follow/<id>/ — follow/unfollow

* GET /api/users/followers/

* GET /api/users/following/

* GET /api/users/friends/

* POST /api/users/friend-requests/send/<id>/

* GET /api/users/friend-requests/incoming/

* GET /api/users/friend-requests/sent/

* POST /api/users/friend-requests/<request_id>/accept/

* POST /api/users/friend-requests/<request_id>/decline/

* POST /api/users/friend-requests/<request_id>/cancel/

* POST /api/users/unfriend/<id>/

---

## Feed (Posts + Comments)

Base path: /api/feed/

### Posts

* GET /api/feed/posts/
  Query: ?author, ?q
  Pagination: ?page, ?page_size

* POST /api/feed/posts/
  Fields: content, visibility, images[], image_captions[]

* GET /api/feed/posts/<id>/

* PATCH /api/feed/posts/<id>/

* DELETE /api/feed/posts/<id>/

* POST /api/feed/posts/<id>/like/
  Body: { "type": "like" | "love" | "haha" }

* GET /api/feed/posts/<id>/reactors/

* GET /api/feed/posts/<id>/likers/

---

### Comments

* GET /api/feed/comments/

* POST /api/feed/comments/
  Fields: post, parent, content

* GET /api/feed/comments/<id>/

* PATCH /api/feed/comments/<id>/

* DELETE /api/feed/comments/<id>/

* POST /api/feed/comments/<id>/like/

* GET /api/feed/comments/<id>/reactors/

---

## Events

Base path: /api/events/

* GET /api/events/
* POST /api/events/

Fields:
name, starts_at, location, details

* GET /api/events/<id>/

* PATCH /api/events/<id>/

* DELETE /api/events/<id>/

* POST /api/events/<event_id>/rsvp/
  Body: { "status": "going" | "interested" }

* DELETE /api/events/<event_id>/rsvp/

---

## 🧪 Common Commands

### Backend

```bash
python manage.py test
python manage.py migrate
python manage.py seed_data
```

### Frontend

```bash
npm run build
npm run lint
```

---

# 🏁 Final Note

This project demonstrates:

* Full-stack system design
* AI-assisted development workflow
* Security and scalability awareness

---

## 🔗 Links

* GitHub: [https://github.com/Soash/buddyscript](https://github.com/Soash/buddyscript)
* Live: [http://139.59.3.116/](http://139.59.3.116/)
* Demo: [https://www.youtube.com/watch?v=xXNGglxiZgI](https://www.youtube.com/watch?v=xXNGglxiZgI)

---


