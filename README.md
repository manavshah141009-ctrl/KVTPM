# KarVicharTohPamm (KVTP)

A minimal, calming spiritual web platform: **24/7-style audio**, **books with PDFs**, **live satsang** (YouTube / embed / basic HLS), a full **admin dashboard**, and **PWA** basics (service worker, offline shell, install prompt).

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion  
- **Backend:** Next.js Route Handlers (REST-style JSON APIs)  
- **Database:** MongoDB via Mongoose  
- **Media:** Local `public/uploads` by default, optional **AWS S3**

## Quick start

1. **Prerequisites:** Node.js 20+, MongoDB running locally or Atlas URI.

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Set `MONGODB_URI`, `JWT_SECRET`, and optionally `NEXT_PUBLIC_APP_URL` (canonical site URL for metadata and absolute links).

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. **Create the first admin** (after MongoDB is reachable):

   ```bash
   npm run seed:admin -- you@email.com YourSecurePassword
   ```

5. Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the dashboard.

## Features

| Area | Behavior |
|------|-----------|
| **Listen** | Tracks from MongoDB; global **sticky player** (play/pause, prev/next, volume); **auto-advance**; playlist bootstraps on public routes. |
| **Books** | Grid + detail; **read online** (PDF in iframe) and **download** when a PDF is attached. |
| **Live** | Admin sets YouTube ID/URL, raw embed URL, or HLS `.m3u8`; optional **`chatEmbedHtml`** for vendor widgets. |
| **Admin** | JWT in **httpOnly cookie**; CRUD for tracks/books; live settings; **multipart upload** API. |
| **PWA** | `public/sw.js` caches navigation shell; `manifest.json`; install prompt when the browser supports `beforeinstallprompt`. |

## Production media

- **Local:** Files go under `public/uploads/{audio,books,covers}`. Ensure the process can write there and that your host persists disk (many serverless hosts do not—prefer S3).

- **S3:** Set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, and `AWS_S3_PUBLIC_BASE` (e.g. `https://cdn.example.com` or `https://bucket.s3.region.amazonaws.com`). Configure a bucket policy so objects are publicly readable (ACLs are not set in code).

- **Large files:** Serverless platforms often cap request body size. For heavy audio/PDF uploads in production, add **presigned POST** uploads to S3 from the admin UI (not included here) or run Node on a VPS.

## App-ready architecture

- **PWA** gives installability and a cached offline **shell** (`/offline` fallback in the service worker).
- **APIs** are plain HTTP JSON under `/api/*`; a future **React Native / Flutter** app can reuse the same endpoints and auth cookie/token pattern (swap cookie for `Authorization: Bearer` if you add mobile clients).

## Mobile app (Android) — Expo React Native

An Android app lives in [`mobile/`](mobile). It reuses your existing APIs:

- Public: `GET /api/tracks`, `GET /api/books`, `GET /api/live`
- Admin: uses `Authorization: Bearer <token>` (token returned by `POST /api/auth/login`)

### Run locally

1. Start the web backend:

```bash
npm run dev
```

2. Set the API base URL for the app:

- Android emulator: keep default `http://10.0.2.2:3000`
- Real phone: set `EXPO_PUBLIC_API_BASE=http://<YOUR_PC_LAN_IP>:3000` in `mobile/.env` (create it)

3. Start the app:

```bash
cd mobile
npm start
```

Then press `a` to run on Android (or scan QR in Expo Go).

### Google Drive audio on mobile

Expo cannot play raw Drive “share” URLs reliably. The app plays audio through:

- `GET /api/stream/drive?id=<FILE_ID>` (see [`src/app/api/stream/drive/route.ts`](src/app/api/stream/drive/route.ts))

Ensure the phone uses the same API base as your Next server (`EXPO_PUBLIC_API_BASE`), and that Drive files are shared as **Anyone with the link**.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build & start |
| `npm run seed:admin` | Upsert admin user |

## Deployment notes

- Set all env vars on your host (Vercel, Railway, VPS, etc.).
- Run `npm run build` with `MONGODB_URI` available if any page that calls `dbConnect` runs at build time; homepage/books/live use ISR with try/catch, but fixing env before build avoids surprises.
- Register the service worker only in production (`src/components/pwa-register.tsx`).

---

Made with a calm layout: saffron `#FF9933`, parchment `#F5F5DC`, soft gold accents, Playfair Display + Source Sans 3.
