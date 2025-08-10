import { Router } from "express";
import {crearColor,eliminarColor,listarColores,modificarColor} from '../../controller/color.controller.js'
import {requireAuthPassport,requireRolePassport} from '../../middlewares/auth.middleware.js'

const color = Router();

color.post("/create", requireAuthPassport, requireRolePassport('admin'), crearColor);       // Crear color
color.get("/list", requireAuthPassport, requireRolePassport('admin'),  listarColores);     // Listar colores
color.put("/update/:id", requireAuthPassport, requireRolePassport('admin'),  modificarColor); // Actualizar color
color.delete("/destroi/:id", requireAuthPassport, requireRolePassport('admin'), eliminarColor); // Eliminar color


export default color