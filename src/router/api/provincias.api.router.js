import { Router } from "express";
import * as provinciaController from "../../controller/provincia.controller.js";
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const provincias = Router();

provincias.post("/create", requireAuthPassport, requireRolePassport('admin'), provinciaController.createProvincia);
provincias.get("/listar", provinciaController.getProvincias);
provincias.get("/listar/:id", provinciaController.getProvinciaById);
provincias.put("/update/:id", requireAuthPassport, requireRolePassport('admin'), provinciaController.updateProvincia);
provincias.delete("/destroi/:id", requireAuthPassport, requireRolePassport('admin'), provinciaController.deleteProvincia);

export default provincias;
