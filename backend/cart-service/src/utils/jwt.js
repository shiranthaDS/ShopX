import jwt from 'jsonwebtoken';

export const TOKEN_COOKIE = 'shopx_token';

export const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET missing');
  return s;
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
};
