import { getTokenFromReq, verifyToken, getUserId } from '../utils/jwt.js';

export function requireUser(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const id = getUserId(payload);
    if (!id) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id };
    req.authToken = token;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
