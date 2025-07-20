import { Router } from "express";
import * as direccionController from "../../controller/direccionEnvio.controller.js";

const DireccionEnvio = Router();

// Crear dirección de envío para un usuario 
// POST http://localhost:8080/api/direccion-envio/create/:userId
DireccionEnvio.post("/create/:userId", direccionController.createDireccionEnvio);

// Listar todas las direcciones de un usuario
// GET http://localhost:8080/api/direccion-envio/list
DireccionEnvio.get("/list", direccionController.getTodasLasDirecciones);

// Obtener una dirección específica de un usuario
// GET http://localhost:8080/api/direccion-envio/list/:id
DireccionEnvio.get("/list/:id", direccionController.getDireccionEnvioById);

// Actualizar una dirección de un usuario
// PUT http://localhost:8080/api/direccion-envio/update/:userId/:id
DireccionEnvio.put("/update/:userId/:id", direccionController.updateDireccionEnvio);

// Eliminar una dirección de un usuario
// DELETE http://localhost:8080/api/direccion-envio/destroi/:userId/:id
DireccionEnvio.delete("/destroi/:userId/:id", direccionController.deleteDireccionEnvio);

export default DireccionEnvio;
