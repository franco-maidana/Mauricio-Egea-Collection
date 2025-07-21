import { Router } from "express";
import * as carritoController from '../../controller/carrito.controller.js'
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const carrito = Router();

carrito.post('/agregar/:user_id', requireAuthPassport, requireRolePassport('admin', 'cliente'), carritoController.addToCart);
carrito.get('/list/:user_id', requireAuthPassport, requireRolePassport('admin', 'cliente'), carritoController.getCarritoByUser);
carrito.put('/update/:user_id', requireAuthPassport, requireRolePassport('admin', 'cliente'), carritoController.updateCantidadEnCarrito);
carrito.delete('/destroi/:user_id/:id', requireAuthPassport, requireRolePassport('admin', 'cliente'), carritoController.deleteCarritoItemById);
carrito.delete('/vaciar/:user_id', requireAuthPassport, requireRolePassport('admin', 'cliente'), carritoController.clearCarrito);

export default carrito;
