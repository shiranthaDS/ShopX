import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const emailValidator = body('email').isEmail().withMessage('Valid email required');
const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  emailValidator,
  passwordValidator,
], register);

router.post('/login', [emailValidator, passwordValidator], login);

router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

export default router;
