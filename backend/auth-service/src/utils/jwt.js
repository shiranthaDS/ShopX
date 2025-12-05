import jwt from 'jsonwebtoken';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
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
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
  // Optional: share cookie across ACA subdomains (auth-service, product-service, etc.)
  // Set JWT_COOKIE_DOMAIN to the ACA environment base domain (e.g., ambitiousbush-23a76182.uaenorth.azurecontainerapps.io)
  // This enables the browser to send the cookie to other services under the same base domain.
  domain: process.env.JWT_COOKIE_DOMAIN || undefined,
};

export const TOKEN_COOKIE = 'shopx_token';
