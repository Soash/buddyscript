# BuddyScript

A full-stack social platform built using **React + Django REST Framework**, designed with a strong focus on **system architecture, scalability, and AI-assisted development**.

---

## 🚀 Tech Stack

* **Backend**: Django REST Framework (JWT Authentication)
* **Frontend**: React (Vite) + Redux Toolkit
* **Database**: PostgreSQL
* **Hosting**: DigitalOcean (VM)

---

## 🌐 Live Demo

* **Live App**: [http://139.59.3.116/](http://139.59.3.116/)
* **Video Walkthrough**: [https://www.youtube.com/watch?v=xXNGglxiZgI](https://www.youtube.com/watch?v=xXNGglxiZgI)

---

## 🧠 System Design Overview

BuddyScript follows a **SPA + REST API architecture**:

* React frontend communicates with Django REST API via JWT authentication
* Backend is modularized into apps: `users`, `feed`, `events`
* PostgreSQL manages relational data (users, posts, relationships)
* Media is served locally (dev) and designed for cloud object storage

**Core Flow:**

```
User → React UI → Axios → DRF API → PostgreSQL → Response → UI Update
```

---

## ✨ Features

### 🔐 Authentication & Authorization

* JWT-based authentication (access + refresh tokens)
* Protected routes and API endpoints
* Object-level permission checks

---

### 👤 User System

* User profiles (name, bio, role, profile photo)
* Follow / Unfollow system
* Friend requests (send, accept, decline, cancel)
* Friends list

---

### 🧵 Feed System

* Create posts (text + images)
* Public / Private visibility
* Comments and nested replies
* Multi-reactions (`like`, `love`, `haha`)
* Infinite scroll with pagination

---

### 🤝 Social Discovery

* Suggested users (filtered)
* “You Might Like” system with dynamic refresh
* User directory with relationship-aware responses

---

### 📅 Events System

* Create, update, delete events
* RSVP (`going`, `interested`)
* Basic search functionality

---

## ⚡ Feature Highlights

* **Connections Hub** with deep-linking:

  * `/connections#friend-request`
  * `/connections#send-request`
  * `/connections#following`

* **Optimized Feed**

  * Paginated API
  * Infinite scrolling (no full dataset loading)

* **Smart Suggestions**

  * Avoids repeated users using `exclude_id`

* **UI Consistency**

  * Global state sync (no refresh needed)
  * Avatar fallback handling

---

## 🏗️ Architecture

### Frontend

* Pages → `src/pages/`
* Components → `src/components/`
* State → Redux Toolkit (`authSlice`, `feedSlice`, etc.)
* API → centralized Axios client

### State Management

* Global: Redux Toolkit (`createAsyncThunk`)
* Local: React `useState`

### Performance Optimizations

* `useMemo` for derived data
* Scoped Redux updates (no full re-fetch)
* Backend pagination to limit rendering

---

## 🔐 Security Considerations

### Current Implementation

* JWT stored in `localStorage`
* Tokens attached via `Authorization: Bearer <token>`

### Tradeoffs

* Simple and fast to implement
* Vulnerable to XSS if not handled properly

### Production Improvements

* HttpOnly + Secure cookies for refresh tokens
* Short-lived access tokens
* Content Security Policy (CSP)
* Strict input sanitization

### CSRF / XSS

* CSRF minimized (token-based auth)
* XSS remains primary concern due to localStorage

---

## 🧩 Backend Design

### API Structure

* `/api/auth/` → Authentication
* `/api/users/` → Profiles & relationships
* `/api/feed/` → Posts & comments
* `/api/events/` → Events system

### Authorization

* Default: `IsAuthenticated`
* Object-level restrictions enforced
* Feed visibility handled in querysets

---

## 📈 Scaling Strategy

Planned improvements for production scale:

* PostgreSQL indexing (`created_at`, `author_id`)
* Object storage (S3-compatible) + CDN
* Redis caching for hot endpoints
* Background jobs (Celery / RQ)
* Full-text search (Postgres / trigram)

---

## ⚖️ Key Engineering Tradeoffs

* Used `localStorage` for JWT for simplicity, with awareness of XSS risks
* Added extra features (events, social graph) to demonstrate system design ability
* Prioritized backend robustness over UI polish due to time constraints

---

## 🔮 Future Improvements

* Switch to HttpOnly cookie-based authentication
* Add Redis caching layer
* Optimize ORM queries (`select_related`, `prefetch_related`)
* Introduce WebSockets for real-time updates
* Improve frontend component abstraction

---

## 🤖 AI Development Workflow

Used **Gemini 3.1 Pro** and **GPT-5.2** as development partners.

### AI Usage

* Codebase navigation
* Feature implementation
* Debugging and edge-case handling

### Prompting Strategy

* “Find the exact file responsible for X”
* “Make minimal patch for Y”
* “Verify build and report issues”

### Validation Process

* Manual code review
* Running builds (`npm run build`)
* Django checks & testing

### Handling AI Errors

* Refined prompts with precise requirements
* Verified logic through actual code flow
* Iterated until behavior matched expectations

---

## ⚙️ Setup Instructions

### Prerequisites

* Python 3.11+
* Node.js 18+

---

### Backend Setup

```bash
python -m venv .venv
source .venv/bin/activate  # or PowerShell equivalent
pip install -r backend/requirements.txt

cd backend
python manage.py migrate
python manage.py runserver
```

---

### Frontend Setup

```bash
cd buddyscript-ui
npm install
npm run dev
```

---

## 🔑 Environment Configuration

### Backend

* Configure `.env` file
* Set:

  * `DJANGO_DEBUG=0`
  * `DJANGO_ALLOWED_HOSTS`
  * `DATABASE_URL`

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

This project was built as part of a full-stack engineering assessment with a focus on:

* System-level thinking
* AI-assisted development
* Security and scalability awareness

---

## 🔗 Links

* GitHub: [https://github.com/Soash/buddyscript](https://github.com/Soash/buddyscript)
* Live: [http://139.59.3.116/](http://139.59.3.116/)
* Demo: [https://www.youtube.com/watch?v=xXNGglxiZgI](https://www.youtube.com/watch?v=xXNGglxiZgI)

---


