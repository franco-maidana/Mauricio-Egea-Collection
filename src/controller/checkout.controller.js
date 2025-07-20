// controllers/checkout.controller.js
import { obtenerCarritoYSubtotal } from "../models/carrito.model.js";
import { getCarritoByUserConTotal } from "../service/carrito.service.js";
import Conexion from "../config/db.js";

export async function getResumenFinal(req, res) {
  try {
    const userId = req.params.userId;
    const direccionId = req.params.direccionId;

    // 1. Obtener productos y total actual del carrito (incluye costo de plataforma)
    const { productos, subtotal, costoPlataforma, total } = await getCarritoByUserConTotal(userId);

    // 2. Buscar provincia de la dirección
    const [dir] = await Conexion.execute(
      "SELECT provincia_id FROM direcciones_envio WHERE id = ? AND user_id = ?",
      [direccionId, userId]
    );
    if (!dir.length) return res.status(404).json({ ok: false, message: "Dirección no encontrada" });

    // 3. Buscar costo de envío de la provincia
    const provinciaId = dir[0].provincia_id;
    const [prov] = await Conexion.execute(
      "SELECT costo_envio FROM provincias WHERE id = ?",
      [provinciaId]
    );
    if (!prov.length) return res.status(404).json({ ok: false, message: "Provincia no encontrada" });

    const costoEnvio = Number(prov[0].costo_envio);

    // 4. Total final: lo que ya tenías + envío
    const totalFinal = total + costoEnvio;

    // 5. Respuesta completa
    return res.json({
      ok: true,
      productos,
      subtotal,
      costoPlataforma,
      costoEnvio,
      total: totalFinal
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
