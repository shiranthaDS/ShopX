import jwt from 'jsonwebtoken';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return secret;
};

export const verifyToken = (token) => jwt.verify(token, getSecret());

export const TOKEN_COOKIE = 'shopx_token';
