import * as direccionService from "../service/direccionEnvio.service.js";

// 1. Crear dirección de envío
export async function createDireccionEnvio(req, res, next) {
  try {
    const userId = req.params.userId;
    const id = await direccionService.crearDireccionEnvio(userId, req.body);
    if (id) {
      const direccion = await direccionService.obtenerDireccionPorId(
        id,
        userId
      );
      return res.status(201).json({
        ok: true,
        message: "Dirección de envío creada correctamente",
        data: direccion,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "No se pudo crear la dirección de envío",
      });
    }
  } catch (err) {
    return res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
}

// 2. Listar direcciones de un usuario
export async function getTodasLasDirecciones(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const user_id = req.query.user_id || null;
    const provincia_id = req.query.provincia_id || null;
    const sort = req.query.sort || "de.id";
    const order = req.query.order || "desc";

    const { direcciones, total } =
      await direccionService.obtenerTodasLasDirecciones({
        user_id,
        provincia_id,
        page,
        limit,
        sort,
        order,
      });

    const totalPages = Math.ceil(total / limit);

    if (direcciones && direcciones.length > 0) {
      return res.status(200).json({
        ok: true,
        message: "Direcciones encontradas",
        data: direcciones,
        pagination: { page, perPage: limit, total, totalPages },
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron direcciones",
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. Obtener una dirección específica de un usuario
export async function getDireccionEnvioById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "ID de dirección inválido",
      });
    }

    const direccion = await direccionService.obtenerDireccionPorId(id);

    if (direccion) {
      return res.status(200).json({
        ok: true,
        data: direccion
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Dirección no encontrada"
      });
    }
  } catch (err) {
    next(err);
  }
}


// 4. Actualizar dirección de un usuario
export async function updateDireccionEnvio(req, res, next) {
  try {
    // Ideal: obtener userId desde el token JWT (ejemplo: req.user.id)
    const userId = parseInt(req.params.userId, 10); // O mejor: req.user.id
    const id = parseInt(req.params.id, 10);

    if (!id || !userId) {
      return res.status(400).json({
        ok: false,
        message: "ID inválido",
      });
    }

    const updated = await direccionService.actualizarDireccionEnvio(
      id,
      userId,
      req.body
    );
    console.log(req.body);

    if (updated) {
      const direccion = await direccionService.obtenerDireccionPorId(
        id,
        userId
      );
      return res.status(200).json({
        ok: true,
        message: "Dirección actualizada correctamente",
        data: direccion,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Dirección no encontrada o sin cambios",
      });
    }
  } catch (err) {
    return res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
}


// 5. Eliminar dirección de un usuario
export async function deleteDireccionEnvio(req, res, next) {
  try {
    const userId = req.params.userId;
    const deleted = await direccionService.eliminarDireccionEnvio(
      req.params.id,
      userId
    );
    if (deleted) {
      return res.status(200).json({
        ok: true,
        message: "Dirección eliminada correctamente",
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Dirección no encontrada",
      });
    }
  } catch (err) {
    next(err);
  }
}
