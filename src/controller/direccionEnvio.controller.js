import * as direccionEnvioService from "../service/direccionEnvio.service.js";

// 1. Crear dirección de envío
export async function createDireccionEnvio(req, res, next) {
  try {
    const id = await direccionEnvioService.crearDireccionEnvio(
      req.params.userId,
      req.body
    );
    if (!id) {
      return res
        .status(400)
        .json({ ok: false, message: "No se pudo crear la dirección de envío" });
    }
    const direccion = await direccionEnvioService.obtenerDireccionPorId(id);
    return res
      .status(201)
      .json({
        ok: true,
        message: "Dirección creada correctamente",
        data: direccion,
      });
  } catch (err) {
    console.error("❌ Error en createDireccionEnvio:", err);
    if (err.message && err.message.includes("Faltan datos")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al crear dirección" });
  }
}

// 2. Listar todas las direcciones (admin)
export async function getDireccionesEnvio(req, res, next) {
  try {
    const direcciones = await direccionEnvioService.listarDireccionesEnvio();
    if (!direcciones || direcciones.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "No se encontraron direcciones de envío" });
    }
    return res.status(200).json({ ok: true, data: direcciones });
  } catch (err) {
    console.error("❌ Error en getDireccionesEnvio:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al listar direcciones" });
  }
}

// 3. Obtener dirección por ID
export async function getDireccionPorId(req, res, next) {
  try {
    const direccion = await direccionEnvioService.obtenerDireccionPorId(
      req.params.id
    );
    if (!direccion) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada" });
    }
    return res.status(200).json({ ok: true, data: direccion });
  } catch (err) {
    if (err.message && err.message.includes("no encontrada")) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada" });
    }
    next(err);
  }
}

// 4. Actualizar dirección
export async function updateDireccionEnvio(req, res, next) {
  try {
    const updated = await direccionEnvioService.actualizarDireccionEnvio(
      req.params.id,
      req.params.userId,
      req.body
    );
    if (!updated) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada o sin cambios" });
    }
    const direccion = await direccionEnvioService.obtenerDireccionPorId(
      req.params.id
    );
    return res.status(200).json({
      ok: true,
      message: "Dirección actualizada correctamente",
      data: direccion,
    });
  } catch (err) {
    if (err.message && err.message.includes("no encontrada")) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada" });
    }
    next(err);
  }
}

// 5. Eliminar dirección
export async function deleteDireccionEnvio(req, res, next) {
  try {
    const deleted = await direccionEnvioService.eliminarDireccionEnvio(
      req.params.id,
      req.params.userId
    );
    if (!deleted) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada" });
    }
    return res
      .status(200)
      .json({ ok: true, message: "Dirección eliminada correctamente" });
  } catch (err) {
    if (err.message && err.message.includes("no encontrada")) {
      return res
        .status(404)
        .json({ ok: false, message: "Dirección no encontrada" });
    }
    next(err);
  }
}
