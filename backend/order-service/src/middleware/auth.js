import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const cookieName = process.env.JWT_COOKIE_NAME || 'shopx_token';
  const token = req.headers.authorization?.split(' ')[1] || req.cookies[cookieName];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.authToken = token;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
