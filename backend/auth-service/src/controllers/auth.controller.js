import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { cookieOptions, signToken, TOKEN_COOKIE } from '../utils/jwt.js';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: 'user' });
    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.cookie(TOKEN_COOKIE, token, cookieOptions);
    return res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.cookie(TOKEN_COOKIE, token, cookieOptions);
    return res.json({ user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    return res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie(TOKEN_COOKIE, { ...cookieOptions, maxAge: 0 });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
