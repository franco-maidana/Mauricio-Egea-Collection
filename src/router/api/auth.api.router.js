import { Router } from "express";
import { login, logout, me, loginPassport, logoutPassport, mePassport } from '../../controller/auth.controller.js';
import { requireAuthPassport } from '../../middlewares/auth.middleware.js';

const authRouter = Router()

// http://localhost:8080/api/auth/login
authRouter.post('/login', loginPassport);
// http://localhost:8080/api/auth/logout
authRouter.post('/logout', logoutPassport);
// http://localhost:8080/api/auth/me
authRouter.get('/me', requireAuthPassport, mePassport);

export default authRouter