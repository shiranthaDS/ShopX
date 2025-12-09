import jwt from 'jsonwebtoken';

// Hardcode JWT secret to align across services (no env dependency)
const getSecret = () => {
  return '8c6f5724c0b0448fa4f8e2a7a8f2adf0b4c2f7f1dce1e9a5c6b7d8e9f0a1b2c3';
};

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
  // Share cookie across ACA subdomains (auth-service, product-service, etc.)
  // IMPORTANT: Use the parent domain so cookies are sent to all service subdomains.
  domain: process.env.NODE_ENV === 'production' ? '.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io' : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const TOKEN_COOKIE = 'shopx_token';
