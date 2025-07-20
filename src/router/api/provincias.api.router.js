import { Router } from "express";
import * as provinciaController from "../../controller/provincia.controller.js";

const router = Router();

// Crear provincia http://localhost:8080/api/provincias/create
router.post("/create", provinciaController.createProvincia);

// Listar provincias http://localhost:8080/api/provincias/listar
router.get("/listar", provinciaController.getProvincias);

// Obtener provincia por ID http://localhost:8080/api/provincias/listar/:id
router.get("/listar/:id", provinciaController.getProvinciaById);

// Actualizar provincia http://localhost:8080/api/provincias/update/:id
router.put("/update/:id", provinciaController.updateProvincia);

// Eliminar provincia  http://localhost:8080/api/provincias/destroi/:id
router.delete("/destroi/:id", provinciaController.deleteProvincia);

export default router;
