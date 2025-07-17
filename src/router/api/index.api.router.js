import { Router } from "express";
import users from "./user.api.router.js";
import authRouter from "./auth.api.router.js";
import categorias from "./categorias.api.router.js";
import talles from "./talles.api.router.js";
import productos from "./productos.api.router.js";
import stock from "./stock.api.router.js";

const apiRouter = Router()

apiRouter.use('/users', users);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categorias', categorias);
apiRouter.use('/talles', talles);
apiRouter.use('/productos', productos);
apiRouter.use('/stock', stock);

export default apiRouter