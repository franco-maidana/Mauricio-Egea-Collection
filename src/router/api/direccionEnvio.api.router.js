import { Router } from "express";
import * as direccionController from "../../controller/direccionEnvio.controller.js";
import { requireAuthPassport, requireRolePassport } from "../../middlewares/auth.middleware.js";

const DireccionEnvio = Router();

// Solo admin puede ver todas las direcciones
DireccionEnvio.get("/list", requireAuthPassport, requireRolePassport('admin'), direccionController.getDireccionesEnvio);

// Admin o cliente pueden crear una dirección
DireccionEnvio.post("/create/:userId", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.createDireccionEnvio);

// Admin o cliente pueden actualizar una dirección
DireccionEnvio.put("/update/:userId/:id", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.updateDireccionEnvio);

// Admin o cliente pueden eliminar una dirección
DireccionEnvio.delete("/destroi/:userId/:id", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.deleteDireccionEnvio);

// Ver dirección específica: cualquier usuario autenticado
DireccionEnvio.get("/list/:id", requireAuthPassport, direccionController.getDireccionPorId);

export default DireccionEnvio;
