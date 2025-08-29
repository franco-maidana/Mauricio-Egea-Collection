import { getPromociones } from "../service/promo.service.js";

export const listarPromociones = async (req, res) => {
  try {
    const { amount = "1000" } = req.query; // fallback a 1000
    const monto = Number(amount);

    const bins = ["450995", "503175", "371180"];
    const promos = await Promise.all(bins.map(bin => getPromociones(bin, monto)));

    res.json({ ok: true, promociones: promos });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

