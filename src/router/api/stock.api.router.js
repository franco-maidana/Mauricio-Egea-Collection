import { Router } from "express";
import * as stockController from '../../controller/stock.controller.js';
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const stock = Router();

// LISTAR STOCK DE TODOS LOS PRODUCTOS - Admin
stock.get('/list', requireAuthPassport, requireRolePassport('admin'), stockController.getStockTodosProductos);

// CREAR/SET - Solo admin
stock.post('/set', requireAuthPassport, requireRolePassport('admin'), stockController.setStock);

// LISTAR STOCK DE UN PRODUCTO - Pública
stock.get('/producto/:id_producto', stockController.getStockPorProducto);

// OBTENER STOCK EXACTO producto+color+talle - Pública
stock.get('/producto/:id_producto/color/:color_id/talle/:talle_id', stockController.getStockPorProductoYTalle);

// ACTUALIZAR STOCK EXACTO - Solo admin
stock.put('/producto/:id_producto/color/:color_id/talle/:talle_id', requireAuthPassport, requireRolePassport('admin'), stockController.updateStock);

// ELIMINAR COMBINACIÓN EXACTA - Solo admin
stock.delete('/producto/:id_producto/color/:color_id/talle/:talle_id', requireAuthPassport, requireRolePassport('admin'), stockController.deleteStock);

export default stock;
