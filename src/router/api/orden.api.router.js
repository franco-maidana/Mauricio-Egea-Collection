import { Router } from "express";
import { listarMisOrdenes, listarTodasLasOrdenes, buscarPorNumeroOrden, buscarPorPaymentId } from "../../controller/orden.controller.js";
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js'; // o el que uses

const ordenes = Router();

// Ruta: historial de compras (solo usuario autenticado)
ordenes.get("/mis-compras", requireAuthPassport, listarMisOrdenes);

// Ruta: ver todas las órdenes (solo admin)
ordenes.get("/todas", requireAuthPassport, requireRolePassport('admin'), listarTodasLasOrdenes);

ordenes.post("/buscar/numero", requireAuthPassport, requireRolePassport('admin'), buscarPorNumeroOrden);

ordenes.post("/buscar/payment", requireAuthPassport, requireRolePassport('admin'), buscarPorPaymentId);

export default ordenes;
