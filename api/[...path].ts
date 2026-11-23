import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../src/server/app.ts';

/**
 * Vercel Serverless Catch-All Function Entry Point for all /api/* routes
 * (e.g. /api/rsvp, /api/host-ledger/status, /api/host-ledger/rsvps, etc.)
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
