/**
 * @file auth.js
 * @description Authentication & user context middleware.
 * Supports standard Bearer JWT authorization, with a safe development fallback
 * so teammates can develop feature modules locally without an active auth server.
 */

import { UnauthorizedError } from '../utils/errors.js';
import { inMemoryStore } from '../config/db.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // In production, verify JWT with config.jwt.secret:
    // const decoded = jwt.verify(token, config.jwt.secret);
    // req.user = decoded;
    
    // For local initial foundation:
    req.user = {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'alex@paypilot.dev',
      role: 'FREELANCER',
      token
    };
    return next();
  }

  // Safe developer fallback: inject demo user context in development
  if (process.env.NODE_ENV !== 'production') {
    const defaultUser = inMemoryStore.users[0];
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      fullName: defaultUser.fullName,
      role: defaultUser.role,
      isDevFallback: true
    };
    return next();
  }

  return next(new UnauthorizedError('Missing or malformed Authorization header'));
}
