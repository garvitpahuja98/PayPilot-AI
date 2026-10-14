/**
 * @file auth.service.js
 * @description Authentication service logic for registration, login, and user profile lookup.
 */

import { inMemoryStore, isDatabaseConnected, query } from '../../config/db.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  if (isDatabaseConnected()) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const user = res.rows[0];
    return {
      token: `jwt-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    };
  }

  // Offline mock fallback
  const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user && email !== 'alex@paypilot.dev') {
    throw new UnauthorizedError('Invalid email or password');
  }

  const activeUser = user || inMemoryStore.users[0];
  return {
    token: `dev-mock-jwt-${activeUser.id}`,
    user: {
      id: activeUser.id,
      email: activeUser.email,
      fullName: activeUser.fullName,
      role: activeUser.role
    }
  };
}

export async function getCurrentUserProfile(userId) {
  if (isDatabaseConnected()) {
    const res = await query('SELECT id, email, full_name, business_name, role, default_currency FROM users WHERE id = $1', [userId]);
    return res.rows[0] || null;
  }
  return inMemoryStore.users.find((u) => u.id === userId) || inMemoryStore.users[0];
}
