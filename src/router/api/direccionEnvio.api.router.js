import { Router } from "express";
import * as direccionController from "../../controller/direccionEnvio.controller.js";
import { requireAuthPassport, requireRolePassport } from "../../middlewares/auth.middleware.js";

const DireccionEnvio = Router();

// Solo admin puede ver todas las direcciones
DireccionEnvio.get(
  "/",
  requireAuthPassport,
  requireRolePassport("admin"),
  direccionController.getDireccionesEnvio
);

// Crear dirección (cliente o admin)
DireccionEnvio.post(
  "/create",
  requireAuthPassport,
  requireRolePassport("admin", "cliente"),
  direccionController.createDireccionEnvio
);

// Obtener direcciones del usuario autenticado
DireccionEnvio.get(
  "/usuario/mias",
  requireAuthPassport,
  direccionController.getDireccionesPorUsuario
);


// Actualizar dirección (cliente o admin)
DireccionEnvio.put("/update/:id", requireAuthPassport, requireRolePassport("admin", "cliente"), direccionController.updateDireccionEnvio );

// Eliminar dirección (cliente o admin, soft delete)
DireccionEnvio.delete(
  "/:id",
  requireAuthPassport,
  requireRolePassport("admin", "cliente"),
  direccionController.deleteDireccionEnvio
);

// Obtener dirección específica (cualquier usuario autenticado)
DireccionEnvio.get(
  "/:id",
  requireAuthPassport,
  direccionController.getDireccionPorId
);

export default DireccionEnvio;
