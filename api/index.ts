import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../src/server/app.ts';

/**
 * Vercel Serverless Function Entry Point for /api and /api/index
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
