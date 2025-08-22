import * as direccionEnvioService from "../service/direccionEnvio.service.js";

// 1. Crear dirección de envío
export const createDireccionEnvio = async (req, res, next) => {
  try {
    const userId = req.user?.id; // ✅ Passport mete el usuario en req.user
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
    }

    const idNueva = await direccionEnvioService.crearDireccionEnvio(userId, req.body);

    res.status(201).json({
      ok: true,
      message: "Dirección creada con éxito",
      id: idNueva,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Listar todas las direcciones (admin)
export async function getDireccionesEnvio(req, res, next) {
  try {
    const direcciones = await direccionEnvioService.listarDireccionesEnvio();
    return res.status(200).json({ ok: true, data: direcciones });
  } catch (err) {
    console.error("❌ Error en getDireccionesEnvio:", err);
    return res.status(500).json({ ok: false, message: "Error interno al listar direcciones" });
  }
}

// 3. Obtener dirección por ID
export async function getDireccionPorId(req, res, next) {
  try {
    const direccion = await direccionEnvioService.obtenerDireccionPorId(req.params.id);
    if (!direccion) {
      return res.status(404).json({ ok: false, message: "Dirección no encontrada" });
    }
    return res.status(200).json({ ok: true, data: direccion });
  } catch (err) {
    next(err);
  }
}

// 4. Actualizar dirección
export async function updateDireccionEnvio(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
    }

    const updated = await direccionEnvioService.actualizarDireccionEnvio(
      req.params.id,
      userId,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: "Dirección no encontrada o sin cambios",
      });
    }

    const direccion = await direccionEnvioService.obtenerDireccionPorId(req.params.id);
    return res.status(200).json({
      ok: true,
      message: "Dirección actualizada correctamente",
      data: direccion,
    });
  } catch (err) {
    next(err);
  }
}

// 5. Eliminar dirección (soft delete → activo = 0)
export async function deleteDireccionEnvio(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
    }

    const deleted = await direccionEnvioService.eliminarDireccionEnvio(
      req.params.id,
      userId
    );

    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Dirección no encontrada" });
    }

    return res.status(200).json({
      ok: true,
      message: "Dirección eliminada correctamente",
    });
  } catch (err) {
    next(err);
  }
}

// Obtener todas las direcciones del usuario autenticado
export async function getDireccionesPorUsuario(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "No autenticado" });
    }

    const direcciones = await direccionEnvioService.obtenerDireccionesPorUsuario(userId);

    return res.status(200).json({
      ok: true,
      data: direcciones,
    });
  } catch (err) {
    next(err);
  }
}
