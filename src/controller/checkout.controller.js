import { resumenFinalPorUsuario } from '../service/checkout.service.js';

export async function getResumenFinal(req, res) {
  try {
    const userId = req.user?.id;
    const resumen = await resumenFinalPorUsuario(userId);
    return res.json({
      ok: true,
      ...resumen
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
