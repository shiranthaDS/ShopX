import { TOKEN_COOKIE, verifyToken } from '../utils/jwt.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded; // { sub, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const optionalAuth = (req, _res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (e) {}
  next();
};
