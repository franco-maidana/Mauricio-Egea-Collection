import * as provinciaService from "../service/provincias.service.js";

export async function createProvincia(req, res, next) {
  try {
    const id = await provinciaService.crearProvincia(req.body);
    if (!id) {
      return res.status(400).json({ ok: false, message: "No se pudo crear la provincia" });
    }
    const provincia = await provinciaService.obtenerProvinciaPorId(id);
    return res.status(201).json({ ok: true, data: provincia });
  } catch (err) {
    if (err.message.includes("Ya existe")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (err.message.includes("datos")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    next(err);
  }
}

export async function getProvincias(req, res, next) {
  try {
    const provincias = await provinciaService.listarProvincias();
    if (!provincias || provincias.length === 0) {
      return res.status(404).json({ ok: false, message: "No se encontraron provincias" });
    }
    return res.status(200).json({ ok: true, data: provincias });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Error interno al listar provincias" });
  }
}

export async function getProvinciaById(req, res, next) {
  try {
    const provincia = await provinciaService.obtenerProvinciaPorId(req.params.id);
    if (!provincia) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada" });
    }
    return res.status(200).json({ ok: true, data: provincia });
  } catch (err) {
    if (err.message.includes("no encontrada")) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada" });
    }
    next(err);
  }
}

export async function updateProvincia(req, res, next) {
  try {
    const updated = await provinciaService.actualizarProvincia(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada o sin cambios" });
    }
    const provincia = await provinciaService.obtenerProvinciaPorId(req.params.id);
    return res.status(200).json({ ok: true, data: provincia });
  } catch (err) {
    if (err.message.includes("Ya existe")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (err.message.includes("no encontrada")) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada" });
    }
    next(err);
  }
}

export async function deleteProvincia(req, res, next) {
  try {
    const deleted = await provinciaService.eliminarProvincia(req.params.id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada" });
    }
    return res.status(200).json({ ok: true, message: "Provincia eliminada correctamente" });
  } catch (err) {
    if (err.message.includes("no encontrada")) {
      return res.status(404).json({ ok: false, message: "Provincia no encontrada" });
    }
    next(err);
  }
}

