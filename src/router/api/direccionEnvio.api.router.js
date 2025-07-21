import { Router } from "express";
import * as direccionController from "../../controller/direccionEnvio.controller.js";
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const DireccionEnvio = Router();

// Solo admin puede ver todas las direcciones
DireccionEnvio.get("/list", requireAuthPassport, requireRolePassport('admin'), direccionController.getTodasLasDirecciones);

// Admin o cliente pueden crear, actualizar y eliminar
DireccionEnvio.post("/create/:userId", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.createDireccionEnvio);
DireccionEnvio.put("/update/:userId/:id", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.updateDireccionEnvio);
DireccionEnvio.delete("/destroi/:userId/:id", requireAuthPassport, requireRolePassport('admin', 'cliente'), direccionController.deleteDireccionEnvio);

// Ver dirección específica: cualquier autenticado
DireccionEnvio.get("/list/:id", requireAuthPassport, direccionController.getDireccionEnvioById);

export default DireccionEnvio;
