import { Router } from 'express';
import { login, refresh, register, logout } from '@/controllers/auth';
import { validate } from '@/middlewares/validate';
import { loginSchema, registerSchema } from '@/schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
