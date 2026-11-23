import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCsvDocument,
  escapeCsvCell,
  parseCsvRows,
  sanitizeIncomingRsvp,
  UTF8_BOM,
} from './rsvpCsv.ts';

test('escapeCsvCell neutralizes spreadsheet formula injection prefixes and quotes commas/newlines', () => {
  assert.equal(escapeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(escapeCsvCell('+91 94155 63327'), `'+91 94155 63327`);
  assert.equal(escapeCsvCell('-1+1'), `'-1+1`);
  assert.equal(escapeCsvCell('@SUM(A1:A2)'), `'@SUM(A1:A2)`);
  assert.equal(escapeCsvCell('Pratapgarh, UP'), '"Pratapgarh, UP"');
  assert.equal(escapeCsvCell('Line 1\nLine 2'), '"Line 1\nLine 2"');
  assert.equal(escapeCsvCell('श्री राजेश शर्मा'), 'श्री राजेश शर्मा');
});

test('sanitizeIncomingRsvp validates fields, enforces ceremony allowlist, and clamps blessings', () => {
  const bad = sanitizeIncomingRsvp({ guestName: 'A', attending: 'accept', guestCount: 2 }, 'id-1');
  assert.equal(bad.ok, false);

  const good = sanitizeIncomingRsvp(
    {
      guestName: '  श्री आनंद त्रिपाठी  ',
      guestContact: 'Prayagraj',
      attending: 'accept',
      guestCount: 4,
      selectedCeremonies: ['shubh-vivah', 'malicious-id', 'tilakotsav', 'shubh-vivah'],
      blessingsNote: 'सपरिवार हार्दिक शुभकामनाएँ',
    },
    'rsvp-101',
    '2026-11-23T10:00:00.000Z'
  );
  assert.equal(good.ok, true);
  assert.equal(good.record?.guestName, 'श्री आनंद त्रिपाठी');
  assert.deepEqual(good.record?.selectedCeremonies, ['shubh-vivah', 'tilakotsav']);
  assert.equal(good.record?.guestCount, 4);
});

test('buildCsvDocument and parseCsvRows round-trip Devanagari and multiline blessings with UTF-8 BOM', () => {
  const res = sanitizeIncomingRsvp(
    {
      guestName: 'श्रीमती मीरा मिश्रा',
      guestContact: '+91 98765 43210',
      attending: 'accept',
      guestCount: 3,
      selectedCeremonies: ['shubh-vivah'],
      blessingsNote: 'ईश्वर नवयुगल को\nसदैव सुखी रखें!',
    },
    'rsvp-202',
    '2026-11-23T12:00:00.000Z'
  );
  assert.equal(res.ok, true);
  const csv = buildCsvDocument([res.record!]);
  assert.ok(csv.startsWith(UTF8_BOM));
  const rows = parseCsvRows(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'Record ID');
  assert.equal(rows[1][2], 'श्रीमती मीरा मिश्रा');
  assert.equal(rows[1][3], `'+91 98765 43210`);
  assert.equal(rows[1][7], 'ईश्वर नवयुगल को\nसदैव सुखी रखें!');
});
