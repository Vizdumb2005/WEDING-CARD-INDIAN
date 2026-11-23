import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  buildCsvDocument,
  CSV_HEADERS,
  escapeCsvCell,
  parseCsvRows,
  sanitizeIncomingRsvp,
  serializeRsvpCsvRow,
  UTF8_BOM,
  type StoredRsvpRecord,
} from './src/utils/rsvpCsv.ts';

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// Private server-only storage directory (strictly OUTSIDE public/ and dist/)
const DATA_DIR = path.resolve(process.cwd(), 'data');
const CSV_PATH = path.resolve(DATA_DIR, 'rsvp-guest-list.csv');
const AUTH_PATH = path.resolve(DATA_DIR, 'host-auth.json');
const DRIVE_META_PATH = path.resolve(DATA_DIR, 'drive-link.json');

// Verify resolved storage paths remain strictly confined inside DATA_DIR
function assertConfinedPath(targetPath: string): string {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Storage path escapes private data directory.');
  }
  return resolved;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
}

function ensureCsvInitialized(): void {
  ensureDataDir();
  const safePath = assertConfinedPath(CSV_PATH);
  if (!fs.existsSync(safePath)) {
    const headerLine = CSV_HEADERS.map((h) => escapeCsvCell(h)).join(',');
    fs.writeFileSync(safePath, `${UTF8_BOM}${headerLine}\r\n`, { encoding: 'utf8', mode: 0o600 });
  }
}

function appendRsvpToCsv(record: StoredRsvpRecord): void {
  ensureCsvInitialized();
  const safePath = assertConfinedPath(CSV_PATH);
  const rowLine = `${serializeRsvpCsvRow(record)}\r\n`;
  fs.appendFileSync(safePath, rowLine, { encoding: 'utf8' });
}

interface ParsedCsvEntry {
  id: string;
  submittedAtIst: string;
  guestName: string;
  guestContact: string;
  response: string;
  guestCount: number;
  ceremonies: string;
  blessingsNote: string;
}

function readGuestListFromCsv(): ParsedCsvEntry[] {
  ensureCsvInitialized();
  const safePath = assertConfinedPath(CSV_PATH);
  const raw = fs.readFileSync(safePath, 'utf8');
  const rows = parseCsvRows(raw);
  if (rows.length <= 1) return [];

  // Strip optional formula-neutralizing leading apostrophe for clean dashboard display
  const unprefix = (v: string) => (v.startsWith("'") ? v.slice(1) : v);

  return rows
    .slice(1)
    .map((cols) => ({
      id: cols[0] || '',
      submittedAtIst: cols[1] || '',
      guestName: unprefix(cols[2] || ''),
      guestContact: unprefix(cols[3] || ''),
      response: cols[4] || '',
      guestCount: Number.parseInt(cols[5] || '0', 10) || 0,
      ceremonies: unprefix(cols[6] || ''),
      blessingsNote: unprefix(cols[7] || ''),
    }))
    .reverse();
}

interface StoredDriveLinkMeta {
  fileId: string;
  fileName: string;
  viewLink: string;
  directDownloadLink: string;
  lastSyncedAtIso: string;
}

function readDriveLinkMeta(): StoredDriveLinkMeta | null {
  try {
    const safePath = assertConfinedPath(DRIVE_META_PATH);
    if (!fs.existsSync(safePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(safePath, 'utf8')) as StoredDriveLinkMeta;
    if (
      parsed &&
      typeof parsed.fileId === 'string' &&
      /^[A-Za-z0-9_-]{8,128}$/.test(parsed.fileId) &&
      typeof parsed.viewLink === 'string' &&
      parsed.viewLink.startsWith('https://drive.google.com/')
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDriveLinkMeta(meta: StoredDriveLinkMeta): void {
  ensureDataDir();
  const safePath = assertConfinedPath(DRIVE_META_PATH);
  fs.writeFileSync(safePath, JSON.stringify(meta, null, 2), { encoding: 'utf8', mode: 0o600 });
}

// =============================================================================
// Private Host Authentication & Signed Bearer Session Tokens (Server-Side Only)
// =============================================================================

const SESSION_SIGNING_KEY =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface StoredAuthHash {
  salt: string;
  hash: string;
  claimedAtIso: string;
}

function getEnvPasscode(): string {
  return (process.env.GUEST_LIST_ADMIN_PASSCODE || '').trim();
}

function readClaimedAuth(): StoredAuthHash | null {
  try {
    const safePath = assertConfinedPath(AUTH_PATH);
    if (!fs.existsSync(safePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(safePath, 'utf8')) as StoredAuthHash;
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function hashPasscodeScrypt(passcode: string, saltHex: string): string {
  return crypto.scryptSync(passcode, saltHex, 64).toString('hex');
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyHostPasscode(candidate: string): boolean {
  const envPass = getEnvPasscode();
  if (envPass.length > 0) {
    return timingSafeCompareStrings(candidate, envPass);
  }
  const claimed = readClaimedAuth();
  if (!claimed) return false;
  const derived = hashPasscodeScrypt(candidate, claimed.salt);
  const bufA = Buffer.from(derived, 'hex');
  const bufB = Buffer.from(claimed.hash, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function issueHostToken(): string {
  const payload = JSON.stringify({
    role: 'host-ledger',
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

function verifyHostToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'host-ledger' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireHostAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Host authorization required.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!verifyHostToken(token)) {
    res.status(401).json({ error: 'Session expired or unauthorized.' });
    return;
  }
  next();
}

// =============================================================================
// Express Server Setup
// =============================================================================

async function createServer() {
  const app = express();
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '16kb' }));

  // 1. Public Guest RSVP Submission -> Appends cleanly to private server-side CSV
  app.post('/api/rsvp', (req, res) => {
    const recordId = `RSVP-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(2)
      .toString('hex')
      .toUpperCase()}`;
    const result = sanitizeIncomingRsvp(req.body, recordId);

    if (!result.ok || !result.record) {
      res.status(400).json({ error: result.error || 'Invalid RSVP submission.' });
      return;
    }

    try {
      appendRsvpToCsv(result.record);
      res.status(201).json({ ok: true, id: result.record.id });
    } catch {
      res.status(500).json({ error: 'Unable to save RSVP right now.' });
    }
  });

  // 2. Host Guest Ledger Auth Status (never exposes secrets)
  app.get('/api/host-ledger/status', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (getEnvPasscode().length > 0) {
      res.json({ mode: 'env-passcode' });
      return;
    }
    const claimed = readClaimedAuth();
    res.json({ mode: claimed ? 'claimed' : 'needs-setup' });
  });

  // 3. First-Run One-Time Host Passcode Claim (Locked permanently once claimed or env set)
  app.post('/api/host-ledger/claim', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (getEnvPasscode().length > 0 || readClaimedAuth()) {
      res.status(409).json({ error: 'Host passcode is already configured.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 72) {
      res.status(400).json({ error: 'Passcode must be between 6 and 72 characters.' });
      return;
    }

    try {
      ensureDataDir();
      const safeAuthPath = assertConfinedPath(AUTH_PATH);
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPasscodeScrypt(passcode, salt);
      const authData: StoredAuthHash = {
        salt,
        hash,
        claimedAtIso: new Date().toISOString(),
      };
      // Atomic exclusive create (wx) so two concurrent requests cannot overwrite
      fs.writeFileSync(safeAuthPath, JSON.stringify(authData, null, 2), {
        encoding: 'utf8',
        mode: 0o600,
        flag: 'wx',
      });
      ensureCsvInitialized();
      res.status(201).json({ ok: true, token: issueHostToken() });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'EEXIST') {
        res.status(409).json({ error: 'Host passcode is already configured.' });
        return;
      }
      res.status(500).json({ error: 'Failed to save host passcode.' });
    }
  });

  // 4. Host Ledger Login -> Issues signed Bearer token
  app.post('/api/host-ledger/login', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode || !verifyHostPasscode(passcode)) {
      res.status(401).json({ error: 'Incorrect host passcode.' });
      return;
    }
    res.json({ ok: true, token: issueHostToken() });
  });

  // 5. Protected Host Guest List JSON View
  app.get('/api/host-ledger/rsvps', requireHostAuth, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const entries = readGuestListFromCsv();
      const acceptingEntries = entries.filter((e) => e.response.startsWith('Joyfully Accepts'));
      const totalConfirmedGuests = acceptingEntries.reduce((sum, e) => sum + e.guestCount, 0);
      res.json({
        entries,
        driveLink: readDriveLinkMeta(),
        summary: {
          totalResponses: entries.length,
          acceptingFamilies: acceptingEntries.length,
          totalConfirmedGuests,
          sendingBlessings: entries.length - acceptingEntries.length,
        },
      });
    } catch {
      res.status(500).json({ error: 'Failed to read guest list.' });
    }
  });

  // 5b. Save Permanent Google Drive CSV Link Metadata (Host-Authenticated)
  app.post('/api/host-ledger/drive-meta', requireHostAuth, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const body = (req.body || {}) as Record<string, unknown>;
    const fileId = typeof body.fileId === 'string' ? body.fileId.trim() : '';
    const fileName =
      typeof body.fileName === 'string' && body.fileName.trim().length > 0
        ? body.fileName.trim().slice(0, 120)
        : 'Saurabh-Sang-Ranju-Guest-List.csv';
    const viewLink = typeof body.viewLink === 'string' ? body.viewLink.trim() : '';
    const directDownloadLink =
      typeof body.directDownloadLink === 'string' ? body.directDownloadLink.trim() : '';
    const lastSyncedAtIso =
      typeof body.lastSyncedAtIso === 'string' && !Number.isNaN(Date.parse(body.lastSyncedAtIso))
        ? body.lastSyncedAtIso
        : new Date().toISOString();

    if (!/^[A-Za-z0-9_-]{8,128}$/.test(fileId)) {
      res.status(400).json({ error: 'Invalid Google Drive file ID.' });
      return;
    }
    if (
      !viewLink.startsWith('https://drive.google.com/') ||
      !directDownloadLink.startsWith('https://drive.google.com/')
    ) {
      res.status(400).json({ error: 'Invalid Google Drive link.' });
      return;
    }

    try {
      const meta: StoredDriveLinkMeta = {
        fileId,
        fileName,
        viewLink,
        directDownloadLink,
        lastSyncedAtIso,
      };
      saveDriveLinkMeta(meta);
      res.json({ ok: true, driveLink: meta });
    } catch {
      res.status(500).json({ error: 'Failed to save Google Drive link metadata.' });
    }
  });

  // 6. Protected Host CSV File Download (UTF-8 BOM Excel Devanagari-safe)
  app.get('/api/host-ledger/export.csv', requireHostAuth, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      ensureCsvInitialized();
      const safePath = assertConfinedPath(CSV_PATH);
      const csvContent = fs.existsSync(safePath)
        ? fs.readFileSync(safePath, 'utf8')
        : buildCsvDocument([]);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Saurabh-Sang-Ranju-Guest-List.csv"'
      );
      res.send(csvContent);
    } catch {
      res.status(500).json({ error: 'Failed to export CSV guest list.' });
    }
  });

  // Mount Vite Dev Middleware in dev OR serve built static SPA in production
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding Invitation Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
