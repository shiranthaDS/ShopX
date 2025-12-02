import { TOKEN_COOKIE, verifyToken } from '../utils/jwt.js';

export const requireUser = (req, res, next) => {
  // Accept token from cookie or Authorization header
  const cookieToken = req.cookies?.[TOKEN_COOKIE];
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = cookieToken || headerToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const payload = verifyToken(token);
  const userId = payload?.sub || payload?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: userId, role: payload?.role };
  next();
};
