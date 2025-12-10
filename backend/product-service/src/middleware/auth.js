import { TOKEN_COOKIE, verifyToken } from '../utils/jwt.js';

export const requireAdmin = async (req, res, next) => {
  // Bypass auth if disabled via env var
  if (process.env.DISABLE_ADMIN_AUTH === 'true') {
    req.user = { sub: 'dev', role: 'admin' };
    return next();
  }
  try {
    // Check Authorization header first, then fall back to cookie
    let token = req.cookies?.[TOKEN_COOKIE];
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
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
    // Check Authorization header first, then fall back to cookie
    let token = req.cookies?.[TOKEN_COOKIE];
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (e) {}
  next();
};
