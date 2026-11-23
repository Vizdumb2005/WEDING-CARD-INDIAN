import { WEDDING_DATA } from '../data/weddingData';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export interface RsvpSubmission {
  guestName: string;
  guestContact: string;
  attending: 'accept' | 'blessings';
  guestCount: number;
  selectedCeremonies: string[];
  blessingsNote: string;
  submittedAtIso?: string;
}

export interface RsvpValidationResult {
  valid: boolean;
  errors: {
    guestName?: string;
    selectedCeremonies?: string;
    guestCount?: string;
  };
}

/**
 * Computes time remaining until the wedding timestamp (IST) cleanly without negative values.
 */
export function computeCountdown(targetIso: string, nowMs: number = Date.now()): CountdownParts {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Formats two-digit zero-padded countdown integers for tabular numerals.
 */
export function padTwo(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

/**
 * Clamps pull-to-reveal scroll drag distance to [0, 1] and reports snap threshold (>= 45%).
 */
export function computeScrollDragProgress(deltaY: number, maxPullPx: number = 170): {
  progress: number;
  shouldSnapOpen: boolean;
} {
  const safeMax = Math.max(1, maxPullPx);
  const progress = Math.max(0, Math.min(1, deltaY / safeMax));
  return {
    progress,
    shouldSnapOpen: progress >= 0.45,
  };
}

/**
 * Evaluates a guest's tap or finger swipe across the couple's forehead for the Apply Tilak ritual.
 * - During drag: maps upward or across-forehead movement smoothly into [0, 1] paint progress.
 * - On release: treats a direct tap inside the forehead zone OR a >= 14px swipe as complete.
 */
export function evaluateTilakGesture(
  dx: number,
  dy: number,
  isRelease: boolean,
  thresholdPx: number = 22
): {
  progress: number;
  completed: boolean;
  mode: 'tap' | 'swipe';
} {
  const safeThreshold = Math.max(8, thresholdPx);
  const travel = Math.hypot(dx, dy);
  const upwardBias = Math.max(0, -dy);
  const effectiveTravel = Math.max(upwardBias * 1.15, travel);
  const progress = Math.max(0, Math.min(1, effectiveTravel / safeThreshold));

  if (isRelease) {
    if (travel < 10) {
      return { progress: 1, completed: true, mode: 'tap' };
    }
    return {
      progress: effectiveTravel >= safeThreshold * 0.62 ? 1 : progress,
      completed: effectiveTravel >= safeThreshold * 0.62,
      mode: 'swipe',
    };
  }

  return {
    progress,
    completed: progress >= 1,
    mode: 'swipe',
  };
}

/**
 * Validates RSVP form input strictly before dispatch (never silently substitutes missing names).
 */
export function validateRsvpForm(input: RsvpSubmission): RsvpValidationResult {
  const errors: RsvpValidationResult['errors'] = {};
  const trimmedName = input.guestName.trim();

  if (trimmedName.length < 2) {
    errors.guestName = 'कृपया अपना शुभ नाम लिखें · Please enter your full name.';
  }

  if (input.attending === 'accept') {
    if (input.guestCount < 1 || input.guestCount > 10 || !Number.isInteger(input.guestCount)) {
      errors.guestCount = 'Guests must be between 1 and 10.';
    }
    if (!input.selectedCeremonies || input.selectedCeremonies.length === 0) {
      errors.selectedCeremonies = 'Please choose at least one ceremony you plan to attend.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Builds the structured bilingual plain-text WhatsApp RSVP message string.
 */
export function buildWhatsAppRsvpMessage(input: RsvpSubmission): string {
  const ceremonyLabels = input.selectedCeremonies
    .map((id) => {
      const found = WEDDING_DATA.ceremonies.find((c) => c.id === id);
      return found ? `${found.titleHindi} (${found.dateDisplay})` : id;
    })
    .join(', ');

  const statusLine =
    input.attending === 'accept'
      ? 'सपरिवार पधारेंगे · Joyfully Accepts'
      : 'शुभाशीष प्रेषित · Sends Warm Blessings';

  const lines: string[] = [
    `*${WEDDING_DATA.invocations.ganeshNamah} — RSVP Confirmation*`,
    `Wedding: ${WEDDING_DATA.couple.groomFullHindi} ${WEDDING_DATA.couple.connectorHindi} ${WEDDING_DATA.couple.brideFullHindi}`,
    '',
    `Name: ${input.guestName.trim()}`,
  ];

  if (input.guestContact.trim()) {
    lines.push(`Phone / City: ${input.guestContact.trim()}`);
  }

  lines.push(`Response: ${statusLine}`);

  if (input.attending === 'accept') {
    lines.push(`Total Guests: ${input.guestCount}`);
    if (ceremonyLabels) {
      lines.push(`Attending Ceremonies: ${ceremonyLabels}`);
    }
  }

  if (input.blessingsNote.trim()) {
    lines.push(`Blessings: ${input.blessingsNote.trim()}`);
  }

  lines.push('', WEDDING_DATA.rsvpAutomation.autoReplyTriggerTag);

  return lines.join('\n');
}

/**
 * Generates the exact pre-filled WhatsApp wa.me deep link for Saurabh Pandey (+91 94155 63327).
 */
export function buildWhatsAppDeepLink(input: RsvpSubmission): string {
  const message = buildWhatsAppRsvpMessage(input);
  return `https://wa.me/${WEDDING_DATA.rsvpAutomation.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}

/**
 * Formats a JS Date into UTC ICS format YYYYMMDDTHHMMSSZ.
 */
function toIcsUtcStamp(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getUTCFullYear();
  const m = padTwo(d.getUTCMonth() + 1);
  const day = padTwo(d.getUTCDate());
  const hr = padTwo(d.getUTCHours());
  const min = padTwo(d.getUTCMinutes());
  const sec = padTwo(d.getUTCSeconds());
  return `${y}${m}${day}T${hr}${min}${sec}Z`;
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Generates a standards-compliant .ics calendar file for Shubh Vivah (09 Dec 2026, 5:00 PM IST).
 */
export function buildWeddingIcsContent(): string {
  const dtStart = toIcsUtcStamp(WEDDING_DATA.dates.weddingIsoIst);
  const dtEnd = toIcsUtcStamp(WEDDING_DATA.dates.weddingEndIsoIst);
  const dtStamp = toIcsUtcStamp('2026-11-23T12:00:00Z');
  const summary = `${WEDDING_DATA.couple.groomShortEnglish} Sang ${WEDDING_DATA.couple.brideShortEnglish} — Shubh Vivah`;
  const location = `${WEDDING_DATA.locations.departure.hostName}, ${WEDDING_DATA.locations.departure.landmarkAndPin}`;
  const description = [
    WEDDING_DATA.invocations.ganeshNamah,
    `${WEDDING_DATA.couple.groomFullHindi} ${WEDDING_DATA.couple.connectorHindi} ${WEDDING_DATA.couple.brideFullHindi}`,
    WEDDING_DATA.locations.baraatNoticeText,
    `Directions: ${WEDDING_DATA.locations.departure.mapsUrl}`,
    `RSVP / Contact: ${WEDDING_DATA.rsvpAutomation.whatsappDisplay}`,
  ].join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaurabhRanjuVivah//RoyalInvitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:saurabh-ranju-vivah-20261209@invitation.local',
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${WEDDING_DATA.locations.departure.mapsUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
