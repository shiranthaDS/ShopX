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
  secure: true, // Always secure for production
  sameSite: 'none', // Always none for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
  // Hardcode shared domain for all ACA services
  domain: '.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io',
};

export const TOKEN_COOKIE = 'shopx_token';
