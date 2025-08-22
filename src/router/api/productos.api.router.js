import { Router } from "express";
import * as productoController from '../../controller/producto.controller.js';
import uploadProducto from '../../config/multerProducto.js'
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js'
import sanitize from "../../middlewares/sanitize.middleware.js";

const productos = Router();

// CREATE - Solo admin
productos.post('/create', requireAuthPassport, requireRolePassport('admin'), uploadProducto.single('imagen'), sanitize, productoController.createProducto);

// LIST - Solo admin y cliente autenticados
productos.get('/list',  productoController.getAllProductos);
productos.get('/list/:id', productoController.getProductoById);
// LISTAR POR CATEGORÍA - Pública
productos.get("/categoria/:categoria_id", productoController.getProductosByCategoria);

productos.get("/descuentos", productoController.getProductosConDescuento);

productos.get("/buscar/:termino", productoController.buscarProductos);
// UPDATE - Solo admin
productos.put('/update/:id', requireAuthPassport, requireRolePassport('admin'), uploadProducto.single('imagen'), sanitize , productoController.updateProducto);

// DELETE - Solo admin
productos.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), productoController.deleteProducto);

// =========================
// NUEVAS RUTAS PARA DESCUENTO GLOBAL
// =========================

// Aplicar descuento global - Solo admin
productos.post('/descuento/global', requireAuthPassport, requireRolePassport('admin'), productoController.aplicarDescuentoGlobal);

// Quitar descuento global - Solo admin
productos.delete('/descuento/quitar', requireAuthPassport, requireRolePassport('admin'), productoController.quitarDescuentoGlobal);

export default productos;
