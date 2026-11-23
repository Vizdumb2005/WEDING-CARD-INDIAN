import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeddingIcsContent,
  buildWhatsAppDeepLink,
  buildWhatsAppRsvpMessage,
  computeCountdown,
  computeScrollDragProgress,
  evaluateTilakGesture,
  validateRsvpForm,
} from './weddingLogic';
import { WEDDING_DATA } from '../data/weddingData';

test('computeCountdown calculates exact remaining days, hours, minutes, and seconds before wedding', () => {
  const target = WEDDING_DATA.dates.weddingIsoIst; // 2026-12-09T17:00:00+05:30
  const oneDayTwoHoursBefore =
    new Date(target).getTime() - (1 * 86400 + 2 * 3600 + 15 * 60 + 42) * 1000;
  const result = computeCountdown(target, oneDayTwoHoursBefore);

  assert.equal(result.isPast, false);
  assert.equal(result.days, 1);
  assert.equal(result.hours, 2);
  assert.equal(result.minutes, 15);
  assert.equal(result.seconds, 42);
});

test('computeCountdown clamps cleanly to zeros after wedding time', () => {
  const target = WEDDING_DATA.dates.weddingIsoIst;
  const afterWedding = new Date(target).getTime() + 60_000;
  const result = computeCountdown(target, afterWedding);

  assert.equal(result.isPast, true);
  assert.equal(result.days, 0);
  assert.equal(result.hours, 0);
  assert.equal(result.minutes, 0);
  assert.equal(result.seconds, 0);
});

test('computeScrollDragProgress snaps open at 45% pull threshold and clamps bounds', () => {
  assert.deepEqual(computeScrollDragProgress(-20, 160), { progress: 0, shouldSnapOpen: false });
  assert.deepEqual(computeScrollDragProgress(64, 160), { progress: 0.4, shouldSnapOpen: false });
  assert.deepEqual(computeScrollDragProgress(72, 160), { progress: 0.45, shouldSnapOpen: true });
  assert.deepEqual(computeScrollDragProgress(400, 160), { progress: 1, shouldSnapOpen: true });
});

test('evaluateTilakGesture supports gentle upward swipe progress and single tap completion', () => {
  const midSwipe = evaluateTilakGesture(0, -10, false, 22);
  assert.equal(midSwipe.completed, false);
  assert.ok(midSwipe.progress > 0.4 && midSwipe.progress < 0.7);

  const fullSwipe = evaluateTilakGesture(4, -24, false, 22);
  assert.equal(fullSwipe.completed, true);
  assert.equal(fullSwipe.progress, 1);

  const directTap = evaluateTilakGesture(2, -1, true, 22);
  assert.equal(directTap.completed, true);
  assert.equal(directTap.mode, 'tap');
});

test('validateRsvpForm rejects empty guest name and empty ceremonies when accepting', () => {
  const emptyName = validateRsvpForm({
    guestName: ' ',
    guestContact: '',
    attending: 'accept',
    guestCount: 2,
    selectedCeremonies: ['shubh-vivah'],
    blessingsNote: '',
  });
  assert.equal(emptyName.valid, false);
  assert.ok(emptyName.errors.guestName);

  const noCeremony = validateRsvpForm({
    guestName: 'Ananya Mishra',
    guestContact: '',
    attending: 'accept',
    guestCount: 2,
    selectedCeremonies: [],
    blessingsNote: '',
  });
  assert.equal(noCeremony.valid, false);
  assert.ok(noCeremony.errors.selectedCeremonies);

  const blessingsOnly = validateRsvpForm({
    guestName: 'Ramesh Tiwari',
    guestContact: 'Lucknow',
    attending: 'blessings',
    guestCount: 1,
    selectedCeremonies: [],
    blessingsNote: 'Heartfelt blessings to the couple!',
  });
  assert.equal(blessingsOnly.valid, true);
});

test('buildWhatsAppDeepLink targets 919415563327 with bilingual message and #SaurabhRanjuVivah tag', () => {
  const submission = {
    guestName: 'Vikram Singh',
    guestContact: 'Pratapgarh',
    attending: 'accept' as const,
    guestCount: 3,
    selectedCeremonies: ['tilakotsav', 'shubh-vivah'],
    blessingsNote: 'Wishing Saurabh & Ranju a joyful married life.',
  };

  const msg = buildWhatsAppRsvpMessage(submission);
  assert.match(msg, /\*श्री गणेशाय नमः — RSVP Confirmation\*/);
  assert.match(msg, /Vikram Singh/);
  assert.match(msg, /Total Guests: 3/);
  assert.match(msg, /शुभ विवाह/);
  assert.match(msg, /#SaurabhRanjuVivah/);

  const link = buildWhatsAppDeepLink(submission);
  assert.ok(link.startsWith('https://wa.me/919415563327?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]), msg);
});

test('buildWeddingIcsContent generates valid VCALENDAR with exact Google Maps URL and IST UTC conversion', () => {
  const ics = buildWeddingIcsContent();
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('DTSTART:20261209T113000Z')); // 17:00 IST = 11:30 UTC
  assert.ok(ics.includes('https://maps.app.goo.gl/VgCL69bbck5FAVY78?g_st=aw'));
  assert.ok(ics.includes('END:VCALENDAR'));
});
