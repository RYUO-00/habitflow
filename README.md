# HabitFlow — Habit + Finance Tracker (React + Express + MongoDB + Google Login)

## Run locally
1. Create the database and Google credentials (see below), then:
2. `cd server && cp .env.example .env` (fill in values) `&& npm install && npm run dev`
3. `cd client && cp .env.example .env` (fill in Client ID) `&& npm install && npm run dev`
4. Open http://localhost:5173

## MongoDB Atlas
1. mongodb.com/atlas -> create free account -> create a free M0 cluster.
2. Database Access -> Add user (username + password).
3. Network Access -> Add IP -> "Allow access from anywhere" (0.0.0.0/0) for development.
4. Connect -> Drivers -> copy the connection string, replace USER/PASSWORD, add `/habitflow` before the `?`.
5. Paste it as MONGO_URI in server/.env.

## Google Sign-In
1. console.cloud.google.com -> create a project.
2. APIs & Services -> OAuth consent screen -> External -> fill app name + your email -> add yourself as a test user.
3. Credentials -> Create credentials -> OAuth client ID -> Web application.
4. Authorised JavaScript origins: `http://localhost:5173` (add your production frontend URL later).
5. Copy the Client ID into BOTH server/.env (GOOGLE_CLIENT_ID) and client/.env (VITE_GOOGLE_CLIENT_ID).
6. Set JWT_SECRET in server/.env to any long random string.

## Deploy
- Backend (Render/Railway): root `server`, start `npm start`, set all env vars, NODE_ENV=production, CLIENT_URL=<frontend URL>.
- Frontend (Vercel/Netlify): root `client`, build `npm run build`, output `dist`, set VITE_GOOGLE_CLIENT_ID and VITE_API_URL=<backend URL>.
- Add the frontend URL to Google "Authorised JavaScript origins".

## Troubleshooting
- "origin_mismatch": the URL in your browser isn't listed in Authorised JavaScript origins.
- Login works but you are bounced out in production: check NODE_ENV=production and that CLIENT_URL exactly matches the frontend URL.
- Mongo connection error: check password characters (URL-encode them) and Atlas IP allow-list.
