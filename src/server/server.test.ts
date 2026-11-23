import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createWeddingApp,
  issueHostToken,
  verifyHostToken,
} from './app.ts';
import {
  appendRsvpToCsv,
  getStorageDir,
  readDriveLinkMeta,
  readGuestListFromCsv,
  readRawCsv,
  saveDriveLinkMeta,
} from './storage.ts';

describe('Server & Vercel Compatibility Suite', () => {
  it('getStorageDir provides a valid writable directory and falls back in Vercel mode', () => {
    const normalDir = getStorageDir();
    assert.strictEqual(typeof normalDir, 'string');
    assert.ok(normalDir.length > 0);

    const prevVercel = process.env.VERCEL;
    try {
      process.env.VERCEL = '1';
      const vercelDir = getStorageDir();
      assert.strictEqual(typeof vercelDir, 'string');
      assert.ok(vercelDir.toLowerCase().includes('wedding-data'));
    } finally {
      if (prevVercel !== undefined) {
        process.env.VERCEL = prevVercel;
      } else {
        delete process.env.VERCEL;
      }
    }
  });

  it('generates, signs, and verifies host Bearer session tokens', () => {
    const token = issueHostToken();
    assert.strictEqual(typeof token, 'string');
    assert.ok(token.includes('.'));

    const isValid = verifyHostToken(token);
    assert.strictEqual(isValid, true);

    const isTamperedValid = verifyHostToken(`${token}tampered`);
    assert.strictEqual(isTamperedValid, false);

    const isGarbageValid = verifyHostToken('invalid.token');
    assert.strictEqual(isGarbageValid, false);
  });

  it('handles RSVP submission and CSV retrieval via storage module', async () => {
    const testRecord = {
      id: `TEST-${Date.now()}`,
      submittedAtIso: new Date().toISOString(),
      submittedAtIst: '23/11/2026, 11:30:00 pm',
      guestName: 'परीक्षण अतिथि (Test Guest)',
      guestContact: '9876543210',
      attending: 'accept' as const,
      guestCount: 3,
      selectedCeremonies: ['shubh-vivah', 'tilakotsav'],
      blessingsNote: 'सदा सुखी रहो, बहुत बहुत बधाई।',
    };

    await appendRsvpToCsv(testRecord);

    const rawCsv = await readRawCsv();
    assert.ok(rawCsv.includes('परीक्षण अतिथि (Test Guest)'));
    assert.ok(rawCsv.includes('9876543210'));

    const entries = await readGuestListFromCsv();
    const found = entries.find((e) => e.id === testRecord.id);
    assert.ok(found);
    assert.strictEqual(found?.guestName, 'परीक्षण अतिथि (Test Guest)');
    assert.strictEqual(found?.guestCount, 3);
  });

  it('stores and retrieves Google Drive link metadata cleanly', async () => {
    const meta = {
      fileId: 'test_drive_file_id_12345678',
      fileName: 'Saurabh-Sang-Ranju-Guest-List.csv',
      viewLink: 'https://drive.google.com/file/d/test_drive_file_id_12345678/view?usp=sharing',
      directDownloadLink: 'https://drive.google.com/uc?export=download&id=test_drive_file_id_12345678',
      lastSyncedAtIso: new Date().toISOString(),
    };

    await saveDriveLinkMeta(meta);
    const retrieved = await readDriveLinkMeta();
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.fileId, meta.fileId);
    assert.strictEqual(retrieved?.viewLink, meta.viewLink);
  });

  it('Express app handles /api/health and /health endpoints', async () => {
    const app = createWeddingApp();

    const mockReq = (url: string) =>
      new Promise<{ status: number; body: any }>((resolve) => {
        let statusCode = 200;
        const res: any = {
          setHeader() {},
          disable() {},
          status(code: number) {
            statusCode = code;
            return this;
          },
          json(data: any) {
            resolve({ status: statusCode, body: data });
          },
          send(data: any) {
            resolve({ status: statusCode, body: data });
          },
        };
        const req: any = {
          url,
          method: 'GET',
          headers: {},
        };
        (app as any)(req, res);
      });

    const res1 = await mockReq('/api/health');
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.status, 'ok');

    const res2 = await mockReq('/health');
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.status, 'ok');
  });

  it('Express app validates incoming RSVP payload over /api/rsvp', async () => {
    const app = createWeddingApp();

    const sendRsvp = (body: any, url = '/api/rsvp') =>
      new Promise<{ status: number; body: any }>((resolve) => {
        let statusCode = 200;
        const res: any = {
          setHeader() {},
          status(code: number) {
            statusCode = code;
            return this;
          },
          json(data: any) {
            resolve({ status: statusCode, body: data });
          },
        };
        const req: any = {
          url,
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        };
        (app as any)(req, res);
      });

    // Valid RSVP
    const okRes = await sendRsvp({
      guestName: 'Vercel Deployment Guest',
      guestContact: '+91 94155 63327',
      attending: 'accept',
      guestCount: 2,
      selectedCeremonies: ['shubh-vivah'],
      blessingsNote: 'Congratulations to Saurabh and Ranju!',
    });
    assert.strictEqual(okRes.status, 201);
    assert.strictEqual(okRes.body.ok, true);
    assert.strictEqual(typeof okRes.body.id, 'string');

    // Invalid RSVP (missing name)
    const badRes = await sendRsvp({
      guestName: '  ',
      attending: 'accept',
      selectedCeremonies: ['shubh-vivah'],
    });
    assert.strictEqual(badRes.status, 400);
    assert.ok(badRes.body.error);

    // Works also via /rsvp without /api prefix
    const okNoPrefix = await sendRsvp(
      {
        guestName: 'No Prefix Guest',
        guestContact: 'Pratapgarh',
        attending: 'blessings',
        guestCount: 0,
        selectedCeremonies: [],
        blessingsNote: 'Warm blessings!',
      },
      '/rsvp'
    );
    assert.strictEqual(okNoPrefix.status, 201);
    assert.strictEqual(okNoPrefix.body.ok, true);
  });
});
