import { Router } from "express";
import * as productoController from '../../controller/producto.controller.js';
import uploadProducto from '../../config/multerProducto.js'
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js'

const productos = Router();

// CREATE - Solo admin
productos.post('/create', requireAuthPassport, requireRolePassport('admin'), uploadProducto.single('imagen'), productoController.createProducto);

// LIST - Solo admin y cliente autenticados
productos.get('/list', requireAuthPassport, requireRolePassport('admin', 'cliente'), productoController.getProductos);
productos.get('/list/:id', requireAuthPassport, requireRolePassport('admin', 'cliente'), productoController.getProductoById);

// UPDATE - Solo admin
productos.put('/update/:id', requireAuthPassport, requireRolePassport('admin'), uploadProducto.single('imagen'), productoController.updateProducto);

// DELETE - Solo admin
productos.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), productoController.deleteProducto);

export default productos;
