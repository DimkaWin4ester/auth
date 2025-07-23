import { Router } from 'express';
import { AuthController } from './controllers/authController';
import { authenticateToken } from './middleware/auth';

const router = Router();

router.use(
  '/auth',
  (() => {
    const router = Router();

    router.post('/register', AuthController.register);
    router.post('/login', AuthController.login);
    router.post('/logout', authenticateToken, AuthController.logout);
    router.post('/refresh', AuthController.refresh);
    router.put('/change-password', authenticateToken, AuthController.changePassword);
    router.get('/me', authenticateToken, AuthController.me);

    return router;
  })(),
);

export default router;
