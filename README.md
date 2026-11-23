# सौरभ संग रंजू · The Royal Wedding Invitation
### 09 December 2026 · Pratapgarh, Uttar Pradesh

An ultra-premium, interactive 3D traditional Indian wedding invitation web application featuring Three.js floral animations (*Pushpa Varsha*), a sacred *Apply Tilak* ritual, authentic Sitar & Shehnai background melodies, interactive ceremonial itinerary, Google Maps venue navigation, WhatsApp RSVP automation, and a private host-only guest ledger with permanent Google Drive CSV sync.

---

## 🚀 Deploy to Vercel

This repository is pre-configured and 100% ready for Vercel deployment without losing any feature or functionality.

### 1. Import Repository into Vercel
1. Push this project to GitHub / GitLab / Bitbucket.
2. In your [Vercel Dashboard](https://vercel.com/new), click **Add New...** > **Project** and select your repository.
3. Vercel automatically detects the framework:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install` or `npm install`

### 2. Environment Variables (in Vercel Project Settings)
In the Vercel deployment settings (or **Settings > Environment Variables**), configure:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GUEST_LIST_ADMIN_PASSCODE` | **Recommended** | Secret passcode for the host to access `/host-guest-ledger` and export CSV. |
| `SESSION_SECRET` | Optional | Random string (16+ chars) to sign host Bearer tokens (a persistent deterministic fallback is auto-generated if omitted). |
| `KV_REST_API_URL` | Optional | If using Vercel KV / Upstash Redis for persistent multi-region storage. |
| `KV_REST_API_TOKEN` | Optional | Token for Vercel KV / Upstash Redis. |

> **Note on Storage:** When running on Vercel Serverless Functions, data storage automatically adapts to the serverless environment (`/tmp`), and optionally syncs seamlessly with Vercel KV / Upstash if attached. Host passcode authentication via `GUEST_LIST_ADMIN_PASSCODE` works instantly across all serverless regions.

### 3. Google Drive Sync on Vercel
The private host guest ledger at `/host-guest-ledger` includes an official **Sync to Google Drive** feature powered by Firebase Auth (`drive.file` scope).
- If using Google Drive sync on your live Vercel domain (e.g. `your-app.vercel.app` or a custom domain):
  1. Open [Firebase Console](https://console.firebase.google.com/) for project `n8nhost-511204`.
  2. Navigate to **Authentication > Settings > Authorized Domains**.
  3. Click **Add Domain** and enter your Vercel deployment domain (e.g. `your-wedding-domain.vercel.app`).

---

## 💻 Run Locally

### Prerequisites
- Node.js 18+ or Bun 1.0+

### Setup & Run
```bash
# 1. Install dependencies
bun install
# (or: npm install)

# 2. Run local development server
bun run dev
# (or: npm run dev)
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test & Build Verification
```bash
# Run unit & server test suite (16 tests)
bun test
# (or: npm test)

# Type-check TypeScript
bun run lint
# (or: npm run lint)

# Production build
bun run build
# (or: npm run build)
```

---

## 🏛️ Application Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Three.js (*Pushpa Varsha* 3D lotus rain and book cover folio).
- **Audio Engine**: Web Audio API synthesizer + uploaded traditional Indian wedding instrumental music track (`Shubh Vivah Mangal Dhun`).
- **Serverless API**: Modular Express application in `src/server/app.ts` with Vercel Serverless Function entry points in `api/index.ts` and `api/[...path].ts`.
- **Private Host Ledger**: `/host-guest-ledger` protected by HMAC-SHA256 signed Bearer tokens with Excel Devanagari UTF-8 BOM CSV export and Google Drive sync.
