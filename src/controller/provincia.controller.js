import * as provinciaService from "../service/provincias.service.js";

// 1. POST /provincias
export async function createProvincia(req, res, next) {
  try {
    const id = await provinciaService.crearProvincia(req.body);
    if (id) {
      const provincia = await provinciaService.obtenerProvinciaPorId(id);
      return res.status(201).json({
        ok: true,
        message: "Provincia creada correctamente",
        data: provincia,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "No se pudo crear la provincia",
      });
    }
  } catch (err) {
    if (
      err.message &&
      (err.message.includes("Ya existe una provincia") || err.message.includes("existe otra provincia"))
    ) {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
    if (err.message && err.message.startsWith("Faltan datos")) {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
    if (err.message && err.message.includes("no puede ser negativo")) {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
    next(err);
  }
}

// 2. GET /provincias
export async function getProvincias(req, res, next) {
  try {
    const provincias = await provinciaService.listarProvincias();
    if (provincias && provincias.length > 0) {
      return res.status(200).json({
        ok: true,
        message: "Provincias encontradas",
        data: provincias,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron provincias",
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. GET /provincias/:id
export async function getProvinciaById(req, res, next) {
  try {
    const provincia = await provinciaService.obtenerProvinciaPorId(req.params.id);
    if (provincia) {
      return res.status(200).json({
        ok: true,
        message: "Provincia encontrada",
        data: provincia,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Provincia no encontrada",
      });
    }
  } catch (err) {
    next(err);
  }
}

// 4. PUT /provincias/:id
export async function updateProvincia(req, res, next) {
  try {
    const updated = await provinciaService.actualizarProvincia(req.params.id, req.body);
    if (updated) {
      const provincia = await provinciaService.obtenerProvinciaPorId(req.params.id);
      return res.status(200).json({
        ok: true,
        message: "Provincia actualizada correctamente",
        data: provincia,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Provincia no encontrada o sin cambios",
      });
    }
  } catch (err) {
    if (
      err.message &&
      (err.message.includes("Ya existe una provincia") || err.message.includes("existe otra provincia"))
    ) {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
    if (err.message && err.message.includes("no puede ser negativo")) {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
    next(err);
  }
}

// 5. DELETE /provincias/:id
export async function deleteProvincia(req, res, next) {
  try {
    const deleted = await provinciaService.eliminarProvincia(req.params.id);
    if (deleted) {
      return res.status(200).json({
        ok: true,
        message: "Provincia eliminada correctamente",
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Provincia no encontrada",
      });
    }
  } catch (err) {
    next(err);
  }
}
