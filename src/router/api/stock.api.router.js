import { Router } from "express";
import * as stockController from '../../controller/stock.controller.js';

const stock = Router();

// 3. Crear o setear stock (si existe, actualiza)
// POST http://localhost:8080/api/stock/set
// Body: { id_producto, talle_id, stock }
stock.post('/set', stockController.setStock);

// 1. Listar todos los talles y stock de un producto
// GET http://localhost:8080/api/stock/producto/:id_producto
stock.get('/producto/:id_producto', stockController.getStockPorProducto);

// 2. Obtener stock de un producto y talle específico
// GET http://localhost:8080/api/stock/producto/:id_producto/talle/:talle_id
stock.get('/producto/:id_producto/talle/:talle_id', stockController.getStockPorProductoYTalle);

// 4. Actualizar stock (solo si existe la combinación)
// PUT http://localhost:8080/api/stock/producto/:id_producto/talle/:talle_id
// Body: { stock }
stock.put('/producto/:id_producto/talle/:talle_id', stockController.updateStock);

// 5. Eliminar combinación producto+talle
// DELETE http://localhost:8080/api/stock/producto/:id_producto/talle/:talle_id
stock.delete('/producto/:id_producto/talle/:talle_id', stockController.deleteStock);

export default stock;
