import * as ColorService from "../service/color.service.js";

// Crear
export const crearColor = async (req, res) => {
  try {
    const { nombre } = req.body;
    const color = await ColorService.crearColor(nombre);
    res.status(201).json({ ok: true, color });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Listar
export const listarColores = async (req, res) => {
  try {
    const colores = await ColorService.obtenerColores();
    res.status(200).json({ ok: true, colores });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Modificar
export const modificarColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    console.log(req.body)
    const updated = await ColorService.actualizarColor(id, nombre);
    if (!updated) return res.status(404).json({ ok: false, message: "Color no encontrado" });
    res.json({ ok: true, message: "Color actualizado" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Eliminar
export const eliminarColor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ColorService.eliminarColor(id);
    if (!deleted) return res.status(404).json({ ok: false, message: "Color no encontrado" });
    res.json({ ok: true, message: "Color eliminado" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
