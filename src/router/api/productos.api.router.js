import { Router } from "express";
import * as productoController from '../../controller/producto.controller.js';
import uploadProducto from '../../config/multerProducto.js'

const productos = Router();

// 1. POST - http://localhost:8080/api/productos/create
productos.post('/create', uploadProducto.single('imagen'), productoController.createProducto);
// 2. GET - http://localhost:8080/api/productos/list
productos.get('/list', productoController.getProductos);
// 3. GET - http://localhost:8080/api/productos/list/:id
productos.get('/list/:id', productoController.getProductoById);
// 4. PUT - http://localhost:8080/api/productos/update/:id
productos.put('/update/:id', uploadProducto.single('imagen'), productoController.updateProducto);
// 5. DELETE - http://localhost:8080/api/productos/destroi/:id
productos.delete('/destroi/:id', productoController.deleteProducto);

export default productos;
