# Project Handoff — Rakesh Portfolio

> Context document for another agent picking up this work. Last updated: 2026-10-28.
> Written from a Claude Code session on Windows 11 (PowerShell, no git installed).

---

## 1. What the user is trying to achieve

The user (Rakesh Parvathneni, a UI/UX designer in Hyderabad) has an existing live
portfolio and, across this session, asked for three things:

1. **Scan/analyze** his live portfolio → `https://rakesh-portfolio-eths.onrender.com/`
2. **Analyze Airbag Studio** (`https://airbagstudio.it/en`) and recreate its animation
   style on his portfolio (he chose **Tier 1 + 2** — see §3).
3. **Connect Firebase + build an admin** where he can edit projects. ← **main active work**

He confirmed: he does **not** have the original portfolio source locally (only the live
URL), so the Firebase work was scaffolded as a **fresh Vite + React project** (this repo).

---

## 2. The existing live portfolio (for reference)

- **Frontend:** `https://rakesh-portfolio-eths.onrender.com/` — React SPA (Vite), Render free tier.
- **Backend:** separate service at `https://rakesh-portfolio-backend-rkgc.onrender.com/api/...`
  (Render free tier). On cold start it hangs → the About / Profile / Services / Projects
  pages get stuck on "Loading…". Images come from **Cloudinary**.
- **Known issues on the live site:** backend cold-start hangs; social links are placeholders
  (`yourwebsite.com`, `linkedin.com`, `behance.net`); route typo `/my-approch`.
- **Real content/contact:**
  - Role: UI/UX Designer, Hyderabad, Telangana, India
  - Email: `rakeshparvathneni26@gmail.com` · Phone: `+91 96406 57114`
  - Stats: `01+` years experience, `10+` clients, `20+` projects
  - Services: UI/UX Design, Web & Landing, SaaS & Apps, Wireframes
  - A known project: **KBK Business Solutions** (Corporate Website · UI/UX)

**Plan going forward:** Firestore becomes the single source of truth for projects; the old
Render backend can be retired for project data.

---

## 3. Airbag Studio animation analysis (for the motion work)

Airbag's stack, confirmed from their JS bundle: **Nuxt/Vue + GSAP + ScrollTrigger +
SplitText + Lenis (smooth scroll) + Three.js/OGL custom GLSL shaders**, PolySans font,
17 animated `<canvas>` elements.

Signature animations, tiered by difficulty:
- **Tier 1 (feel):** Lenis smooth scroll, GSAP word-by-word text reveals, scroll-driven
  full-page color morph, scroll-collapsing nav, custom morphing cursor, marquee.
- **Tier 2 (set-pieces):** 3D perspective section tilt, animated canvas line-art, count-ups.
- **Tier 3 (NOT done):** WebGL shader "particle-dissolve" hero text (bespoke Three.js).

### Deliverable already built: motion PROTOTYPE (separate from this repo)
A self-contained HTML artifact demonstrating Tier 1 + 2 with Rakesh's content.
- Published artifact URL: `https://claude.ai/artifact/N7CVb5qDBq76tPrA9SZGrf` (private to the user's account)
- Source file on disk: `C:\Users\mamat\AppData\Local\Temp\claude\...\scratchpad\rakesh-motion.html`
  (scratchpad — may be cleared; the artifact URL is the durable copy)
- Palette: ink `#141117`, paper `#F3EFE7`, violet `#5B3DF5`, coral `#FF5A3C`.
  Fonts: Bricolage Grotesque (display) / Archivo (body) / Space Mono (mono).
- Uses GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.0.42 (jsDelivr), CSS `@property`
  animated color tokens for the morph.
- **Gotcha fixed:** GSAP `yPercent` word-mask reveals left text stuck hidden (webfont metric/
  timing issue). Fixed by switching to a px-based `y` + `opacity` `gsap.from()` per word.
  **If porting the motion layer, use `y`+`opacity`, not `yPercent` masks.**

> NOTE: the motion prototype has **not** been merged into this Firebase repo yet. The public
> `Home.jsx` here already reads from Firestore, so the motion layer can be layered on top later.

---

## 4. THIS repo — Firebase + Admin (the main deliverable)

**Location:** `C:\Users\mamat\rakesh-portfolio`
**Backup zip:** `C:\Users\mamat\rakesh-portfolio-backup.zip` (source only, no node_modules/dist)

### Stack / versions (pinned in package.json)
- Vite `5.4.10`, @vitejs/plugin-react `4.3.3`
- React / ReactDOM `18.3.1`, react-router-dom `6.27.0`
- firebase `10.14.1` (modular SDK)
- Plain JavaScript + JSX (no TypeScript)

### Structure
```
rakesh-portfolio/
├─ README.md             ← end-user setup guide (Firebase console steps)
├─ HANDOFF.md            ← this file
├─ .env.local            ← Firebase config goes here (currently EMPTY)
├─ .env.example
├─ .gitignore            ← ignores node_modules, dist, .env, .env.local
├─ firestore.rules       ← public read, auth-only write
├─ index.html
├─ vite.config.js
├─ package.json / package-lock.json
└─ src/
   ├─ main.jsx                     BrowserRouter + AuthProvider + App
   ├─ App.jsx                      routes: / , /login , /admin (+ config banner)
   ├─ firebase.js                  init from import.meta.env.VITE_*; exports db, auth, firebaseReady
   ├─ styles.css                   dark theme, violet accent (matches prototype palette)
   ├─ contexts/AuthContext.jsx     onAuthStateChanged, login(email,pw), logout()
   ├─ components/ProtectedRoute.jsx redirects to /login if not signed in
   ├─ services/projects.js         Firestore CRUD: listProjects/createProject/updateProject/removeProject
   └─ pages/
      ├─ Home.jsx                  public — lists projects from Firestore (loading/empty/error states)
      ├─ Login.jsx                 email/password sign-in, friendly error messages
      └─ Admin.jsx                 protected CRUD: add/edit form + list with inline delete-confirm
```

### How it works
- `firebase.js` reads config from `.env.local` (`VITE_FIREBASE_*`). `firebaseReady` is false
  while config is empty → `App.jsx` shows a setup banner, and Home/Login degrade gracefully
  instead of crashing.
- Auth: Firebase Email/Password. `/admin` is wrapped in `ProtectedRoute`.
- Data: Firestore collection **`projects`**, documents shaped:
  `{ title, category, description, imageUrl, link, order:number, createdAt, updatedAt }`.
  `listProjects()` orders by `order` ascending (lower first). `order` is coerced to a number
  in `services/projects.js > normalize()`.
- Images are **URLs pasted into a field** (no upload yet) — matches the old Cloudinary approach.
- Delete uses an **inline two-click confirm** (not `window.confirm`), intentional.

### Security rules (`firestore.rules`)
Public `read`, `write` only if `request.auth != null`. Comment inside shows how to lock to a
single email (`request.auth.token.email == "..."`). **Must be published in the Firebase console.**

---

## 5. Current state / verification

- ✅ `npm install` done (150 packages; npm here blocks postinstall scripts but esbuild still works).
- ✅ `npm run build` succeeds (`vite build` → dist, ~3.8s, no errors). The 621 kB bundle warning
  is just Firebase size — fine; code-split later if desired.
- ⛔ **Not runnable end-to-end yet:** `.env.local` is empty, so Firebase isn't connected.
- ⛔ **git is NOT installed** on this machine — repo is not under version control. Code is saved
  on disk + in the backup zip only.

---

## 6. Outstanding work / next steps

**User must do (requires their Google account — an agent cannot and must not do these):**
1. Create a Firebase project; enable **Firestore** (Production mode, region `asia-south1`).
2. Enable **Authentication → Email/Password**; add a user (the admin login).
3. Paste web config into `.env.local`.
4. Publish `firestore.rules` in the console.
   → Then `npm run dev` and manage projects at `/admin`. Steps are in `README.md`.

**Agent could do next (if asked):**
- Install git (`winget install Git.Git`) → `git init`, commit, optionally push to GitHub.
- Add **Firebase Storage** image uploads (replace the imageUrl text field with a file input).
- **Port the Tier 1+2 motion layer** (from the prototype) onto `Home.jsx` — use `y`+`opacity`
  GSAP reveals (not `yPercent`), Lenis, color morph, etc.
- Add deploy config (Vercel `vercel.json` / Netlify `_redirects` / Firebase Hosting) with SPA
  fallback so `/admin` and `/login` resolve on a static host (noted in README).
- Seed initial projects (e.g. KBK Business Solutions) once Firestore is live.

---

## 7. Hard constraints / safety notes

- **Never create the Firebase project or enter the user's passwords/credentials** — direct the
  user to do it in their console. Firebase web config `VITE_*` values are public by design and
  safe to commit to `.env.local`/client code (data is protected by rules + auth).
- **Firebase cannot run inside a claude.ai artifact** — the artifact sandbox blocks external
  XHR/WebSocket, so Firebase network calls fail there. This must stay a real npm project.
- Environment: Windows, PowerShell (no `&&` chaining — use `;`), git absent.
```

Common commands:
  cd C:\Users\mamat\rakesh-portfolio
  npm install
  npm run dev        # local dev server (needs .env.local filled)
  npm run build      # production build -> dist/
```
