import { TOKEN_COOKIE, verifyToken } from '../utils/jwt.js';

export const requireAdmin = async (req, res, next) => {
  try {
    if (process.env.DISABLE_ADMIN_AUTH === 'true') {
      req.user = { role: 'admin' };
      return next();
    }
    let token = req.cookies?.[TOKEN_COOKIE];
    // Fallback to Authorization: Bearer <token>
    if (!token) {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }
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
    let token = req.cookies?.[TOKEN_COOKIE];
    if (!token) {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (e) {}
  next();
};
