import jwt from 'jsonwebtoken';

function getCookieName() {
  return process.env.JWT_COOKIE_NAME || 'shopx_token';
}

function getJwtSecret() {
  return process.env.JWT_SECRET || '';
}

export function getTokenFromReq(req) {
  const cookieName = getCookieName();
  const c = req.cookies?.[cookieName];
  if (c) return c;
  const h = req.headers.authorization || req.headers.Authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

export function verifyToken(token) {
  try {
    const secret = getJwtSecret();
    if (!secret) return null;
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

export function getUserId(payload) {
  if (!payload) return null;
  return payload.sub || payload.id || payload._id || null;
}

export const cookieName = getCookieName();
