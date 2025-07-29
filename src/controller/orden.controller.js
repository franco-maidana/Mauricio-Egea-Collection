import * as ordenService from '../service/orden.service.js';

// Endpoint: listar compras del usuario autenticado
export async function listarMisOrdenes(req, res, next) {
  try {
    const userId = req.user.id; // el usuario autenticado
    const ordenes = await ordenService.obtenerOrdenesPorUsuario(userId);
    res.status(200).json({ ok: true, ordenes });
  } catch (err) {
    next(err);
  }
}

// Endpoint: listar todas las órdenes (solo admin)
export async function listarTodasLasOrdenes(req, res, next) {
  try {
    // ¡protegé esta ruta con middleware de rol!
    const ordenes = await ordenService.obtenerTodasLasOrdenes();
    res.status(200).json({ ok: true, ordenes });
  } catch (err) {
    next(err);
  }
}

// Buscar orden por número de orden (POST, body)
export async function buscarPorNumeroOrden(req, res, next) {
  try {
    const { numero_orden } = req.body;
    if (!numero_orden) {
      return res.status(400).json({ ok: false, message: "Falta el número de orden" });
    }
    const orden = await ordenService.buscarOrdenPorNumero(numero_orden);
    if (!orden) {
      return res.status(404).json({ ok: false, message: "No se encontró la orden" });
    }
    res.json({ ok: true, orden });
  } catch (err) {
    next(err);
  }
}

// Buscar orden por payment_id_mp (POST, body)
export async function buscarPorPaymentId(req, res, next) {
  try {
    const { payment_id_mp } = req.body;
    if (!payment_id_mp) {
      return res.status(400).json({ ok: false, message: "Falta el payment_id_mp" });
    }
    const orden = await ordenService.buscarOrdenPorPaymentId(payment_id_mp);
    if (!orden) {
      return res.status(404).json({ ok: false, message: "No se encontró la orden" });
    }
    res.json({ ok: true, orden });
  } catch (err) {
    next(err);
  }
}