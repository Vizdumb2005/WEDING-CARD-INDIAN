/**
 * Pure CSV & RSVP Payload Utilities (Shared by Server & Unit Tests)
 * -----------------------------------------------------------------------------
 * - Strict input validation & allowlisting for guest RSVP submissions
 * - CSV formula-injection neutralization (=, +, -, @, tab, CR)
 * - RFC-4180 compliant CSV encoding & parsing with UTF-8 BOM support for Excel Devanagari
 */

export const ALLOWED_CEREMONY_IDS = [
  'tilakotsav',
  'matripujan',
  'shubh-vivah',
  'vadhu-aagman',
] as const;

export const CEREMONY_LABELS_MAP: Record<string, string> = {
  tilakotsav: 'शुभ तिलकोत्सव एवं प्रीतिभोज (05 Dec 2026)',
  matripujan: 'मातृपूजन / यज्ञोपवीत (07 Dec 2026)',
  'shubh-vivah': 'शुभ विवाह (09 Dec 2026)',
  'vadhu-aagman': 'वधू आगमन (10 Dec 2026)',
};

export interface StoredRsvpRecord {
  id: string;
  submittedAtIst: string;
  submittedAtIso: string;
  guestName: string;
  guestContact: string;
  attending: 'accept' | 'blessings';
  guestCount: number;
  selectedCeremonies: string[];
  blessingsNote: string;
}

export const CSV_HEADERS = [
  'Record ID',
  'Submitted At (IST)',
  'Guest Name',
  'Phone / City',
  'Response',
  'Guest Count',
  'Attending Ceremonies',
  'Blessings Note',
] as const;

export const UTF8_BOM = '\uFEFF';

/**
 * Neutralizes spreadsheet formula injection (DDE / Excel / Sheets) and quotes RFC-4180 cells.
 */
export function escapeCsvCell(raw: string | number | null | undefined): string {
  const str = String(raw ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const trimmedStart = str.trimStart();
  const safe =
    trimmedStart.length > 0 && /^[=+\-@\t\r]/.test(trimmedStart) ? `'${str}` : str;
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function formatIstTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function serializeRsvpCsvRow(record: StoredRsvpRecord): string {
  const responseLabel =
    record.attending === 'accept' ? 'Joyfully Accepts (सपरिवार पधारेंगे)' : 'Sends Blessings (शुभाशीष प्रेषित)';
  const ceremoniesLabel =
    record.attending === 'accept'
      ? record.selectedCeremonies.map((id) => CEREMONY_LABELS_MAP[id] || id).join('; ')
      : '-';

  return [
    record.id,
    record.submittedAtIst,
    record.guestName,
    record.guestContact || '-',
    responseLabel,
    record.attending === 'accept' ? record.guestCount : 0,
    ceremoniesLabel,
    record.blessingsNote || '-',
  ]
    .map((cell) => escapeCsvCell(cell))
    .join(',');
}

export function buildCsvDocument(records: StoredRsvpRecord[]): string {
  const headerLine = CSV_HEADERS.map((h) => escapeCsvCell(h)).join(',');
  const rows = records.map(serializeRsvpCsvRow);
  return `${UTF8_BOM}${[headerLine, ...rows].join('\r\n')}\r\n`;
}

/**
 * RFC-4180 CSV parser supporting quoted multiline fields & escaped quotes.
 */
export function parseCsvRows(csvText: string): string[][] {
  const clean = csvText.startsWith(UTF8_BOM) ? csvText.slice(1) : csvText;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.length > 0)) rows.push(row);
  }
  return rows;
}

export interface SanitizedRsvpResult {
  ok: boolean;
  error?: string;
  record?: StoredRsvpRecord;
}

/**
 * Strictly validates and normalizes an untrusted POST /api/rsvp request body.
 */
export function sanitizeIncomingRsvp(
  body: unknown,
  id: string,
  nowIso: string = new Date().toISOString()
): SanitizedRsvpResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid RSVP payload.' };
  }

  const raw = body as Record<string, unknown>;
  const guestName = typeof raw.guestName === 'string' ? raw.guestName.trim().slice(0, 120) : '';
  if (guestName.length < 2) {
    return { ok: false, error: 'Guest name must be at least 2 characters.' };
  }

  const guestContact =
    typeof raw.guestContact === 'string' ? raw.guestContact.trim().slice(0, 100) : '';

  const attending: 'accept' | 'blessings' =
    raw.attending === 'blessings' ? 'blessings' : 'accept';

  let guestCount = 0;
  let selectedCeremonies: string[] = [];

  if (attending === 'accept') {
    const parsedCount = Number(raw.guestCount);
    if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 10) {
      return { ok: false, error: 'Guest count must be an integer between 1 and 10.' };
    }
    guestCount = parsedCount;

    if (!Array.isArray(raw.selectedCeremonies)) {
      return { ok: false, error: 'At least one ceremony must be selected.' };
    }
    const allowedSet = new Set<string>(ALLOWED_CEREMONY_IDS);
    selectedCeremonies = Array.from(
      new Set(
        raw.selectedCeremonies.filter(
          (item): item is string => typeof item === 'string' && allowedSet.has(item)
        )
      )
    );
    if (selectedCeremonies.length === 0) {
      return { ok: false, error: 'At least one valid ceremony must be selected.' };
    }
  }

  const blessingsNote =
    typeof raw.blessingsNote === 'string' ? raw.blessingsNote.trim().slice(0, 600) : '';

  return {
    ok: true,
    record: {
      id,
      submittedAtIso: nowIso,
      submittedAtIst: formatIstTimestamp(nowIso),
      guestName,
      guestContact,
      attending,
      guestCount,
      selectedCeremonies,
      blessingsNote,
    },
  };
}
