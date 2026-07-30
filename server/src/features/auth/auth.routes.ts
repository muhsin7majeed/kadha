import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  getRecoveryStatus,
  login,
  logout,
  manageRecoveryCode,
  recoverAccount,
  refresh,
  register,
} from './auth.controller';
import { loginSchema, manageRecoveryCodeSchema, recoverAccountSchema, registerSchema } from './auth.schema';
import { recoveryRateLimit } from './recovery-rate-limit';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/recovery-code/status', authMiddleware, getRecoveryStatus);
router.post('/recovery-code', authMiddleware, validate(manageRecoveryCodeSchema), manageRecoveryCode);
router.post('/recover', recoveryRateLimit, validate(recoverAccountSchema), recoverAccount);

export default router;
