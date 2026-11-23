import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import { sanitizeIncomingRsvp } from '../utils/rsvpCsv.ts';
import {
  appendRsvpToCsv,
  readClaimedAuth,
  readDriveLinkMeta,
  readGuestListFromCsv,
  readRawCsv,
  saveClaimedAuth,
  saveDriveLinkMeta,
  type StoredAuthHash,
  type StoredDriveLinkMeta,
} from './storage.ts';

// Deterministic signing key fallback across serverless lambdas
function getSessionSigningKey(): string {
  const envSecret = (process.env.SESSION_SECRET || '').trim();
  if (envSecret.length >= 16) {
    return envSecret;
  }
  const envPass = (process.env.GUEST_LIST_ADMIN_PASSCODE || '').trim();
  return crypto
    .createHash('sha256')
    .update(`saurabh-ranju-vivah-session-seed:${envPass || 'default-wedding-session-key-2026'}`)
    .digest('hex');
}

const SESSION_SIGNING_KEY = getSessionSigningKey();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function getEnvPasscode(): string {
  return (process.env.GUEST_LIST_ADMIN_PASSCODE || '').trim();
}

export function hashPasscodeScrypt(passcode: string, saltHex: string): string {
  return crypto.scryptSync(passcode, saltHex, 64).toString('hex');
}

export function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function verifyHostPasscode(candidate: string): Promise<boolean> {
  const envPass = getEnvPasscode();
  if (envPass.length > 0) {
    return timingSafeCompareStrings(candidate, envPass);
  }
  const claimed = await readClaimedAuth();
  if (!claimed) return false;
  const derived = hashPasscodeScrypt(candidate, claimed.salt);
  const bufA = Buffer.from(derived, 'hex');
  const bufB = Buffer.from(claimed.hash, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function issueHostToken(): string {
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

export function verifyHostToken(token: string): boolean {
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

export function requireHostAuth(req: Request, res: Response, next: NextFunction): void {
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

/**
 * Creates the core Express application.
 * All API routes are mounted on both `/api` and `/` so they resolve seamlessly
 * in local development, standard Express servers, and Vercel Serverless Functions.
 */
export function createWeddingApp(): express.Express {
  const app = express();
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '16kb' }));

  const apiRouter = express.Router();

  // Health check endpoint
  apiRouter.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'saurabh-ranju-wedding-api',
      environment: process.env.VERCEL ? 'vercel' : process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Public Guest RSVP Submission -> Appends to private CSV guest list & persistent storage
  apiRouter.post('/rsvp', async (req, res) => {
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
      await appendRsvpToCsv(result.record);
      res.status(201).json({ ok: true, id: result.record.id });
    } catch {
      res.status(500).json({ error: 'Unable to save RSVP right now.' });
    }
  });

  // 2. Host Guest Ledger Auth Status (never exposes secrets)
  apiRouter.get('/host-ledger/status', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (getEnvPasscode().length > 0) {
      res.json({ mode: 'env-passcode' });
      return;
    }
    const claimed = await readClaimedAuth();
    res.json({ mode: claimed ? 'claimed' : 'needs-setup' });
  });

  // 3. First-Run One-Time Host Passcode Claim (Locked permanently once claimed or env set)
  apiRouter.post('/host-ledger/claim', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (getEnvPasscode().length > 0) {
      res.status(409).json({ error: 'Host passcode is configured via environment.' });
      return;
    }
    const existing = await readClaimedAuth();
    if (existing) {
      res.status(409).json({ error: 'Host passcode is already configured.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 72) {
      res.status(400).json({ error: 'Passcode must be between 6 and 72 characters.' });
      return;
    }

    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPasscodeScrypt(passcode, salt);
      const authData: StoredAuthHash = {
        salt,
        hash,
        claimedAtIso: new Date().toISOString(),
      };
      await saveClaimedAuth(authData);
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
  apiRouter.post('/host-ledger/login', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      res.status(401).json({ error: 'Host passcode required.' });
      return;
    }
    const isValid = await verifyHostPasscode(passcode);
    if (!isValid) {
      res.status(401).json({ error: 'Incorrect host passcode.' });
      return;
    }
    res.json({ ok: true, token: issueHostToken() });
  });

  // 5. Protected Host Guest List JSON View
  apiRouter.get('/host-ledger/rsvps', requireHostAuth, async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const entries = await readGuestListFromCsv();
      const driveLink = await readDriveLinkMeta();
      const acceptingEntries = entries.filter((e) => e.response.startsWith('Joyfully Accepts'));
      const totalConfirmedGuests = acceptingEntries.reduce((sum, e) => sum + e.guestCount, 0);
      res.json({
        entries,
        driveLink,
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
  apiRouter.post('/host-ledger/drive-meta', requireHostAuth, async (req, res) => {
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
      await saveDriveLinkMeta(meta);
      res.json({ ok: true, driveLink: meta });
    } catch {
      res.status(500).json({ error: 'Failed to save Google Drive link metadata.' });
    }
  });

  // 6. Protected Host CSV File Download (UTF-8 BOM Excel Devanagari-safe)
  apiRouter.get('/host-ledger/export.csv', requireHostAuth, async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const csvContent = await readRawCsv();
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

  // Register on both /api and / so all router paths match seamlessly
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

const app = createWeddingApp();
export default app;
