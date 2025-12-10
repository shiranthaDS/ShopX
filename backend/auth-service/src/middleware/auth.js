import { TOKEN_COOKIE, verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    // Check Authorization header first, then fall back to cookie
    let token = req.cookies?.[TOKEN_COOKIE];
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
