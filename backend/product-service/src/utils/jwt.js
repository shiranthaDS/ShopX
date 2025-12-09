import jwt from 'jsonwebtoken';

// Hardcode JWT secret to avoid env dependency and align with auth-service
const getSecret = () => {
  return '8c6f5724c0b0448fa4f8e2a7a8f2adf0b4c2f7f1dce1e9a5c6b7d8e9f0a1b2c3';
};

export const verifyToken = (token) => jwt.verify(token, getSecret());

export const TOKEN_COOKIE = 'shopx_token';
