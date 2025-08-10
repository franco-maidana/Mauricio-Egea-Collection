import { resumenFinalPorUsuario } from '../service/checkout.service.js';

export async function getResumenFinal(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
    }

    const resumen = await resumenFinalPorUsuario(userId);

    return res.json({
      ok: true,
      ...resumen
    });

  } catch (error) {
    console.error("❌ Error en getResumenFinal:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}
