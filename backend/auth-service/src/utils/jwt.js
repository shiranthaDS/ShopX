import jwt from 'jsonwebtoken';

// Hardcoded JWT secret to avoid env dependency
const JWT_SECRET = '8c6f5724c0b0448fa4f8e2a7a8f2adf0b4c2f7f1dce1e9a5c6b7d8e9f0a1b2c3';

const getSecret = () => JWT_SECRET;

export const signToken = (payload, options = {}) => {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d', ...options });
};

export const verifyToken = (token) => {
  const secret = getSecret();
  return jwt.verify(token, secret);
};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const TOKEN_COOKIE = 'shopx_token';
