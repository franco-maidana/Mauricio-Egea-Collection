import { Router } from "express";
import { login, logout, me } from '../../controller/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const authRouter = Router()

// http://localhost:8080/api/auth/login
authRouter.post('/login', login);
// http://localhost:8080/api/auth/logout
authRouter.post('/logout', logout);
// http://localhost:8080/api/auth/me
authRouter.get('/me', requireAuth, me);

export default authRouter