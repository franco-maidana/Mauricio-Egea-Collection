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
import ordenes from "./orden.api.router.js";
import test from "./test.router.js";
import color from "./color.api.router.js";

const apiRouter = Router();

// Usuarios y auth
apiRouter.use('/users', users);
apiRouter.use('/auth', authRouter);

// Catálogos
apiRouter.use('/categorias', categorias);
apiRouter.use('/productos', productos);
apiRouter.use('/talles', talles);
apiRouter.use('/color', color);
apiRouter.use('/stock', stock);
apiRouter.use('/provincias', provincias);

// Proceso de compra
apiRouter.use('/carrito', carrito);
apiRouter.use('/direccion-envio', DireccionEnvio);
apiRouter.use('/checkout', checkout);
apiRouter.use('/mercado-pago', mercadoPago);
apiRouter.use('/ordenes', ordenes);

// Desarrollo
if (process.env.NODE_ENV !== 'production') {
  apiRouter.use('/test', test);
}


export default apiRouter;
