import { Router } from "express";
import users from "./user.api.router.js";
import authRouter from "./auth.api.router.js";
import categorias from "./categorias.api.router.js";

const apiRouter = Router()

apiRouter.use('/users', users);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categorias', categorias);

export default apiRouter