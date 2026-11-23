import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildCsvDocument,
  CSV_HEADERS,
  escapeCsvCell,
  parseCsvRows,
  serializeRsvpCsvRow,
  UTF8_BOM,
  type StoredRsvpRecord,
} from '../utils/rsvpCsv.ts';

export interface ParsedCsvEntry {
  id: string;
  submittedAtIst: string;
  guestName: string;
  guestContact: string;
  response: string;
  guestCount: number;
  ceremonies: string;
  blessingsNote: string;
}

export interface StoredDriveLinkMeta {
  fileId: string;
  fileName: string;
  viewLink: string;
  directDownloadLink: string;
  lastSyncedAtIso: string;
}

export interface StoredAuthHash {
  salt: string;
  hash: string;
  claimedAtIso: string;
}

/**
 * Returns a writable data storage directory.
 * When running in Vercel Serverless (where /var/task is read-only) or
 * container environments, safely falls back to os.tmpdir().
 */
export function getStorageDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = path.join(os.tmpdir(), 'saurabh-ranju-wedding-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true, mode: 0o700 });
      } catch {
        // Directory may already exist
      }
    }
    return tmpDir;
  }

  const localDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true, mode: 0o700 });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localDir;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'saurabh-ranju-wedding-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true, mode: 0o700 });
      } catch {
        // ignore
      }
    }
    return tmpDir;
  }
}

// In-memory caches to speed up warm serverless invocations
let memoryCsvCache: string | null = null;
let memoryDriveLinkCache: StoredDriveLinkMeta | null = null;
let memoryClaimedAuthCache: StoredAuthHash | null = null;

function getCsvPath(): string {
  return path.join(getStorageDir(), 'rsvp-guest-list.csv');
}

function getAuthPath(): string {
  return path.join(getStorageDir(), 'host-auth.json');
}

function getDriveMetaPath(): string {
  return path.join(getStorageDir(), 'drive-link.json');
}

function assertConfinedPath(targetPath: string): string {
  const baseDir = getStorageDir();
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) {
    throw new Error('Storage path escapes private data directory.');
  }
  return resolved;
}

function ensureDataDir(): void {
  const dir = getStorageDir();
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    } catch {
      // directory exists
    }
  }
}

// =============================================================================
// Optional Vercel KV / Upstash Redis Persistent Sync (REST API - zero extra deps)
// =============================================================================

function getKvCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && typeof fetch === 'function') {
    return { url, token };
  }
  return null;
}

async function kvGet(key: string): Promise<string | null> {
  const creds = getKvCredentials();
  if (!creds) return null;
  try {
    const res = await fetch(`${creds.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${creds.token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    return typeof data.result === 'string' ? data.result : null;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: string): Promise<boolean> {
  const creds = getKvCredentials();
  if (!creds) return false;
  try {
    const res = await fetch(`${creds.url}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.token}`,
        'Content-Type': 'text/plain',
      },
      body: value,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// CSV & Guest List Methods
// =============================================================================

export function ensureCsvInitialized(): void {
  ensureDataDir();
  const safePath = assertConfinedPath(getCsvPath());
  if (!fs.existsSync(safePath)) {
    const headerLine = CSV_HEADERS.map((h) => escapeCsvCell(h)).join(',');
    const initialContent = `${UTF8_BOM}${headerLine}\r\n`;
    fs.writeFileSync(safePath, initialContent, { encoding: 'utf8', mode: 0o600 });
    memoryCsvCache = initialContent;
  }
}

export async function appendRsvpToCsv(record: StoredRsvpRecord): Promise<void> {
  ensureCsvInitialized();
  const safePath = assertConfinedPath(getCsvPath());
  const rowLine = `${serializeRsvpCsvRow(record)}\r\n`;
  fs.appendFileSync(safePath, rowLine, { encoding: 'utf8' });

  // Update in-memory cache
  try {
    const fullContent = fs.readFileSync(safePath, 'utf8');
    memoryCsvCache = fullContent;
    // Asynchronously sync to Vercel KV if configured
    await kvSet('wedding_rsvp_csv', fullContent);
  } catch {
    // ignore
  }
}

export async function readRawCsv(): Promise<string> {
  ensureCsvInitialized();
  const safePath = assertConfinedPath(getCsvPath());

  // Check Vercel KV for newer records if configured
  const remoteCsv = await kvGet('wedding_rsvp_csv');
  if (remoteCsv && remoteCsv.length > (memoryCsvCache?.length || 0)) {
    try {
      fs.writeFileSync(safePath, remoteCsv, { encoding: 'utf8', mode: 0o600 });
      memoryCsvCache = remoteCsv;
      return remoteCsv;
    } catch {
      return remoteCsv;
    }
  }

  if (memoryCsvCache) {
    return memoryCsvCache;
  }

  if (fs.existsSync(safePath)) {
    const content = fs.readFileSync(safePath, 'utf8');
    memoryCsvCache = content;
    return content;
  }

  return buildCsvDocument([]);
}

export async function readGuestListFromCsv(): Promise<ParsedCsvEntry[]> {
  const raw = await readRawCsv();
  const rows = parseCsvRows(raw);
  if (rows.length <= 1) return [];

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

// =============================================================================
// Drive Metadata Storage
// =============================================================================

export async function readDriveLinkMeta(): Promise<StoredDriveLinkMeta | null> {
  if (memoryDriveLinkCache) {
    return memoryDriveLinkCache;
  }

  // Check KV first if configured
  const remoteMeta = await kvGet('wedding_drive_link_meta');
  if (remoteMeta) {
    try {
      const parsed = JSON.parse(remoteMeta) as StoredDriveLinkMeta;
      if (parsed && typeof parsed.fileId === 'string' && parsed.fileId.length >= 8) {
        memoryDriveLinkCache = parsed;
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    const safePath = assertConfinedPath(getDriveMetaPath());
    if (!fs.existsSync(safePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(safePath, 'utf8')) as StoredDriveLinkMeta;
    if (
      parsed &&
      typeof parsed.fileId === 'string' &&
      /^[A-Za-z0-9_-]{8,128}$/.test(parsed.fileId) &&
      typeof parsed.viewLink === 'string' &&
      parsed.viewLink.startsWith('https://drive.google.com/')
    ) {
      memoryDriveLinkCache = parsed;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveDriveLinkMeta(meta: StoredDriveLinkMeta): Promise<void> {
  memoryDriveLinkCache = meta;
  ensureDataDir();
  const safePath = assertConfinedPath(getDriveMetaPath());
  const serialized = JSON.stringify(meta, null, 2);
  try {
    fs.writeFileSync(safePath, serialized, { encoding: 'utf8', mode: 0o600 });
  } catch {
    // on read-only system, memoryDriveLinkCache and KV persist
  }
  await kvSet('wedding_drive_link_meta', serialized);
}

// =============================================================================
// Host Authentication Hash Storage (Scrypt)
// =============================================================================

export async function readClaimedAuth(): Promise<StoredAuthHash | null> {
  if (memoryClaimedAuthCache) {
    return memoryClaimedAuthCache;
  }

  const remoteAuth = await kvGet('wedding_host_auth');
  if (remoteAuth) {
    try {
      const parsed = JSON.parse(remoteAuth) as StoredAuthHash;
      if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
        memoryClaimedAuthCache = parsed;
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    const safePath = assertConfinedPath(getAuthPath());
    if (!fs.existsSync(safePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(safePath, 'utf8')) as StoredAuthHash;
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      memoryClaimedAuthCache = parsed;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveClaimedAuth(authData: StoredAuthHash): Promise<void> {
  memoryClaimedAuthCache = authData;
  ensureDataDir();
  const safePath = assertConfinedPath(getAuthPath());
  const serialized = JSON.stringify(authData, null, 2);
  try {
    fs.writeFileSync(safePath, serialized, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'EEXIST') {
      throw err;
    }
  }
  await kvSet('wedding_host_auth', serialized);
}
