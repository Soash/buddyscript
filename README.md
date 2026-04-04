# BuddyScript

BuddyScript is a two-part app:
- **Backend**: Django REST API (JWT auth)
- **Frontend**: React + Vite

## Live server
- http://139.59.3.116/

## AI models used
- Gemini 3.1 Pro
- GPT-5.2

## What it does
- Authentication (JWT access/refresh).
- User profiles (name, role, bio, profile photo).
- Social graph: follow/unfollow, friends + friend requests.
- Feed: posts (public/private), comments, and multi-reactions (`like` / `love` / `haha`).
- Events: create events and RSVP.

Most APIs require an authenticated user by default.

## Feature highlights
- **Connections hub**: a dedicated Connections page with tabs for Incoming Requests, Sent Requests, and Following.
  - Deep links supported via hashes: `/connections#friend-request`, `/connections#send-request`, `/connections#following`.
- **Friend requests**: send, accept, decline, and cancel sent requests.
- **Follow system**: follow/unfollow with UI that updates immediately across pages (no refresh required).
- **Suggested People (Left Sidebar)**: shows random users, excluding people you already requested/follow.
- **You Might Like (Right Sidebar)**: shows 1 random user you don’t follow, with an **Ignore** action to load a different suggestion.
  - Supports an `exclude_id` query param to avoid immediately repeating the last suggestion.
- **Feed performance**: paginated feed endpoint + **infinite scroll** on the frontend (does not fetch all posts at once).
- **Quality-of-life**: default avatar fallback when a profile photo is missing/broken.

## Repo structure
- `backend/` — Django project (API is mounted under `/api/`)
- `buddyscript-ui/` — React + Vite frontend

## Prerequisites
- **Python** (recommended 3.11+)
- **Node.js** (18+ recommended) and npm

## Environment
- Backend reads environment variables from `backend/.env`.
  - For local dev, copy `backend/.env.example` → `backend/.env` and adjust as needed.
  - For deployment, set `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, and usually `DATABASE_URL` (Postgres).

### Frontend API base URL
The frontend reads the API base URL from `buddyscript-ui/.env` (copy from `buddyscript-ui/.env.example`):

- `VITE_API_BASE_URL=http://127.0.0.1:8000/api/`

If you change `buddyscript-ui/.env`, restart `npm run dev`.

## Quick start (Windows / PowerShell)

### 1) Backend (Django)
From the repo root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

Backend will run at `http://127.0.0.1:8000/`.

### 2) Frontend (React + Vite)
Open a second terminal:

```powershell
cd buddyscript-ui
npm install
npm run dev
```

Frontend will run at the URL printed by Vite (usually `http://localhost:5173/`).

## API + Auth notes
- API base path: `/api/` (see `backend/backend/urls.py`).
- Auth: JWT (SimpleJWT). Most endpoints expect an authenticated user.
- Frontend API client: `buddyscript-ui/src/api/axios.js`.
  - Base URL comes from `VITE_API_BASE_URL` (with a localhost fallback for dev).

### Authentication header
Send your access token in:

`Authorization: Bearer <access_token>`

### Media URLs
User profile photos and post images are served under `/media/` in development (when `DEBUG=True`).

## API reference (backend)

### Auth (JWT)
- `POST /api/auth/login/` — obtain JWT tokens.
  - Body: `{ "email": "...", "password": "..." }`
- `POST /api/auth/login/refresh/` — refresh access token.
  - Body: `{ "refresh": "..." }`
- `POST /api/auth/register/` — create a new user.
  - Body: `{ "email": "...", "password": "...", "first_name": "...", "last_name": "..." }`

### Users (profiles + relationships)
- `GET /api/users/me/` — get your profile.
- `PATCH /api/users/me/` — update your profile.
  - Fields: `first_name`, `last_name`, `bio`, `role`, `profile_photo` (multipart supported)

- `GET /api/users/<id>/` — get a user profile.

- `GET /api/users/suggested/` — suggested users (random sample).
- `GET /api/users/you-might-like/` — one user suggestion.
  - Query: `?exclude_id=<id>` (optional)

- `GET /api/users/directory/` — list users with relationship annotations.
  - Query: `?q=<search>` (optional)
  - Optional pagination (only when requested): `?page=<n>&page_size=<n>`
  - Response includes: `is_friend`, `is_following`, `incoming_request_id`, `outgoing_request_id`

- `POST /api/users/follow/<id>/` — toggle follow/unfollow.
- `GET /api/users/followers/` — list who follows you.
- `GET /api/users/following/` — list who you follow.
- `GET /api/users/friends/` — list your friends.

- `POST /api/users/friend-requests/send/<id>/` — send friend request.
- `GET /api/users/friend-requests/incoming/` — list incoming friend requests.
- `GET /api/users/friend-requests/sent/` — list sent friend requests.
- `POST /api/users/friend-requests/<request_id>/accept/` — accept.
- `POST /api/users/friend-requests/<request_id>/decline/` — decline.
- `POST /api/users/friend-requests/<request_id>/cancel/` — cancel a sent request.

- `POST /api/users/unfriend/<id>/` — remove friendship.

### Feed (posts + comments)
Base path: `/api/feed/` (DRF router)

**Posts**
- `GET /api/feed/posts/` — list posts visible to you.
  - Query: `?author=<id>` (optional)
  - Query: `?q=<term>` (optional; searches post content, image captions, and author name/email)
  - Pagination: `?page=<n>` and optional `?page_size=<n>`
  - Response (paginated): `{ count, next, previous, results }`
- `POST /api/feed/posts/` — create a post (text and/or images).
  - Fields: `content`, `visibility` (`public`|`private`), `images[]` (multipart), `image_captions[]`
- `GET /api/feed/posts/<id>/` — retrieve post.
- `PATCH /api/feed/posts/<id>/` — update post (author only).
- `DELETE /api/feed/posts/<id>/` — delete post (author only).

- `POST /api/feed/posts/<id>/like/` — toggle/switch reaction.
  - Body: `{ "type": "like" | "love" | "haha" }`
- `GET /api/feed/posts/<id>/reactors/` — list reactors (public posts only).
- `GET /api/feed/posts/<id>/likers/` — list users who reacted (public posts only).

**Comments**
- `GET /api/feed/comments/` — list comments.
- `POST /api/feed/comments/` — create comment.
  - Fields: `post`, `parent` (optional), `content`
- `GET /api/feed/comments/<id>/` — retrieve comment.
- `PATCH /api/feed/comments/<id>/` — update comment.
- `DELETE /api/feed/comments/<id>/` — delete comment.

- `POST /api/feed/comments/<id>/like/` — toggle/switch reaction.
  - Body: `{ "type": "like" | "love" | "haha" }`
- `GET /api/feed/comments/<id>/reactors/` — list reactors.

### Events
Base path: `/api/events/`

- `GET /api/events/` — list events (includes `going_count` and `my_rsvp_status`).
- `POST /api/events/` — create event.
  - Fields: `name`, `starts_at` (datetime), `location` (optional), `details` (optional)

- `GET /api/events/<id>/` — retrieve event.
- `PATCH /api/events/<id>/` — update event (creator only).
- `DELETE /api/events/<id>/` — delete event (creator only).

- `POST /api/events/<event_id>/rsvp/` — set RSVP.
  - Body: `{ "status": "going" | "interested" }`
- `DELETE /api/events/<event_id>/rsvp/` — remove RSVP.

## Common commands

### Backend
```powershell
cd backend
python manage.py test
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

### Frontend
```powershell
cd buddyscript-ui
npm run lint
npm run build
```

