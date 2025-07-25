import { Router } from "express";
import users from "./user.api.router.js";
import authRouter from "./auth.api.router.js";
import categorias from "./categorias.api.router.js";
import talles from "./talles.api.router.js";
import productos from "./productos.api.router.js";
import stock from "./stock.api.router.js";
import carrito from "./carrito.api.router.js";
import provincias from "./provincias.api.router.js";
import DireccionEnvio from "./direccionEnvio.api.router.js";
import checkout from "./checkout.api.router.js";
import mercadoPago from "./mercadoPago.js";

const apiRouter = Router()

apiRouter.use('/users', users);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categorias', categorias);
apiRouter.use('/talles', talles);
apiRouter.use('/productos', productos);
apiRouter.use('/stock', stock);
apiRouter.use('/carrito', carrito);
apiRouter.use('/provincias', provincias);
apiRouter.use('/direccion-envio', DireccionEnvio);
apiRouter.use('/checkout', checkout);
apiRouter.use('/mercado-pago', mercadoPago);

export default apiRouter