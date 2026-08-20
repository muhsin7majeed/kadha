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
import { loginRateLimit, refreshRateLimit, registrationRateLimit } from './auth-rate-limit';
import { recoveryRateLimit } from './recovery-rate-limit';
import { requireJsonAuthRequest, validateAuthRequestOrigin } from './auth-request-security';

const router = Router();

router.use(validateAuthRequestOrigin, requireJsonAuthRequest);

router.post('/register', registrationRateLimit, validate(registerSchema), register);
router.post('/login', loginRateLimit, validate(loginSchema), login);
router.post('/refresh', refreshRateLimit, refresh);
router.post('/logout', logout);
router.get('/recovery-code/status', authMiddleware, getRecoveryStatus);
router.post('/recovery-code', authMiddleware, validate(manageRecoveryCodeSchema), manageRecoveryCode);
router.post('/recover', recoveryRateLimit, validate(recoverAccountSchema), recoverAccount);

export default router;
