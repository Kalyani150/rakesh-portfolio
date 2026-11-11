# Rakesh Portfolio — Website + Admin

Two separate Vite + React apps in one npm workspace, sharing one Firebase project:

| app       | folder     | dev URL               | purpose                                              |
|-----------|------------|-----------------------|------------------------------------------------------|
| Website   | `website/` | http://localhost:5173 | Public portfolio. Read-only; lists projects from Firestore. No auth code. |
| Admin     | `admin/`   | http://localhost:5174 | Private dashboard. Email/password login; manage projects and the Home / About / Services content. |

Deploy them separately (e.g. `yoursite.com` and `admin.yoursite.com`).

## 1. Install (once, from the repo root)

```bash
npm install
```

## 2. Create your Firebase project (one-time, in the browser)

You must do these steps yourself — they require your Google account.

1. <https://console.firebase.google.com/> → **Add project**.
2. **Build → Firestore Database → Create database** (Production mode, e.g. `asia-south1`).
3. **Build → Authentication → Sign-in method → Email/Password → Enable.**
4. **Authentication → Users → Add user** — this is your admin login.
5. **Project settings → General → Your apps → Web app (`</>`)** → copy the config.
6. Paste the values into **`.env.local`** in the repo root (shared by both apps):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_SITE_URL=http://localhost:5173
   ```

   These values are public by design; data is protected by the rules below.

## 3. Publish security rules

Firestore → **Rules** → paste [`firestore.rules`](./firestore.rules) → **Publish**.
Public read, signed-in write. Restrict to your email if you like (see comment in the file).

## 4. Run

```bash
npm run dev:website     # public site  (5173)
npm run dev:admin       # admin panel  (5174)
```

Build: `npm run build` (both), or `npm run build:website` / `npm run build:admin`.
Output goes to `website/dist` and `admin/dist`.

## Admin panel

Sign in, then use the sidebar (top bar on mobile):

- **Projects** - add / edit / delete, search, image preview, up/down buttons to reorder
  (renumbers `order`), two-click delete. Title is required; URLs must start with `http`.
- **Home**, **About**, **Services** - edit the site text and repeating rows (add, remove, reorder),
  then **Save**. Each is stored as one document in the `content` collection. If a document
  does not exist yet, the form shows defaults; nothing is written until you save.

An "Unsaved changes" hint shows while edits are pending. Re-publish `firestore.rules` after
updating - it now also allows public read / signed-in write on `content`.

## Data model

Collection **`content`** (docs `home`, `about`, `services`; public read, signed-in write):
`home` = `{role, firstName, lastName, location, imageUrl, experienceYears, clientsCount,
totalProjectsCount, tickerText, ctaHeading, services:[{title}]}`; `about` = `{fullName, title, bio,
imageUrl, experiences:[{period, role, company, points}], education:[{degree, institution}]}`;
`services` = `{items:[{num, title, desc, cardDesc}]}`; all with `updatedAt`.

Collection **`projects`**: `title` (string, required), `category`, `description`,
`imageUrl`, `link`, `order` (number, ascending), `createdAt`, `updatedAt`.

## Deploying

Each app is a static build. Because both use client-side routing, add an SPA fallback
on the host (Vercel rewrite to `/index.html`, Netlify `_redirects`
`/*  /index.html  200`, or Firebase Hosting single-page app). For production set
`VITE_SITE_URL` to the live website URL, and add the admin domain under
**Authentication → Settings → Authorized domains**.
