import { Router } from "express";
import * as carritoController from '../../controller/carrito.controller.js'


const carrito = Router();

// 1. POST - http://localhost:8080/api/carrito/agregar/:user_id
carrito.post('/agregar/:user_id', carritoController.addToCart);

// 2. GET - http://localhost:8080/api/carrito/list/:user_id
carrito.get('/list/:user_id', carritoController.getCarritoByUser);

// 3. PUT - http://localhost:8080/api/carrito/update/:user_id
carrito.put("/update/:user_id", carritoController.updateCantidadEnCarrito);

// 4. DELETE - http://localhost:8080/api/carrito/destroi/:user_id/:id
carrito.delete("/destroi/:user_id/:id", carritoController.deleteCarritoItemById);

// 4. DELETE - http://localhost:8080/api/carrito/vaciar/:user_id
carrito.delete("/vaciar/:user_id", carritoController.clearCarrito);

export default carrito;
