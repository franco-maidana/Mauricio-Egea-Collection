import { Router } from "express";
import * as stockController from '../../controller/stock.controller.js';
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const stock = Router();

// CREAR/SET - Solo admin
stock.post('/set', requireAuthPassport, requireRolePassport('admin'), stockController.setStock );

// LISTAR STOCK DE UN PRODUCTO - Pública
stock.get('/producto/:id_producto', stockController.getStockPorProducto);

// OBTENER STOCK DE PRODUCTO+TALLE - Pública
stock.get('/producto/:id_producto/talle/:talle_id', stockController.getStockPorProductoYTalle);

// ACTUALIZAR STOCK - Solo admin
stock.put('/producto/:id_producto/talle/:talle_id', requireAuthPassport, requireRolePassport('admin'), stockController.updateStock );

// ELIMINAR STOCK - Solo admin
stock.delete('/producto/:id_producto/talle/:talle_id', requireAuthPassport, requireRolePassport('admin'), stockController.deleteStock );

export default stock;
