import * as talleService from "../service/talle.service.js";

// 1. POST /talles
export async function createTalle(req, res, next) {
  try {
    const { etiqueta } = req.body;
    const talle = await talleService.createTalle(etiqueta);
    if (talle) {
      return res.status(201).json({
        ok: true,
        message: "Talle creado correctamente",
        data: { talle_id: talle, etiqueta }
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "No se pudo crear el talle"
      });
    }
  } catch (err) {
    if (err.code === "DUPLICATE_TALLE") {
      return res.status(400).json({
        ok: false,
        message: "La etiqueta del talle ya existe."
      });
    }
    if (err.code === "VALIDATION_ERROR") {
      return res.status(400).json({
        ok: false,
        message: err.message
      });
    }
    next(err);
  }
}

// 2. GET /talles
export async function getTalles(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const { talles, total } = await talleService.listTallesPaginated(page, limit);

    const totalPages = Math.ceil(total / limit);

    if (talles && talles.length > 0) {
      return res.status(200).json({
        ok: true,
        message: 'Talles encontrados',
        data: talles,
        pagination: {
          page,
          perPage: limit,
          total,
          totalPages
        }
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: 'No se encontraron talles'
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. GET /talles/:id
export async function getTalleById(req, res, next) {
  try {
    const talle = await talleService.findTalleById(req.params.id);
    if (talle) {
      return res.status(200).json({
        ok: true,
        message: "Talle encontrado",
        data: talle
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Talle no encontrado"
      });
    }
  } catch (err) {
    next(err);
  }
}

// 4. PUT /talles/:id
export async function updateTalle(req, res, next) {
  try {
    const updated = await talleService.updateTalle(req.params.id, req.body);
    if (updated) {
      const talle = await talleService.findTalleById(req.params.id);
      return res.status(200).json({
        ok: true,
        message: "Talle actualizado correctamente",
        data: talle,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Talle no encontrado o sin cambios"
      });
    }
  } catch (err) {
    if (err.code === "DUPLICATE_TALLE") {
      return res.status(400).json({
        ok: false,
        message: "La etiqueta del talle ya existe."
      });
    }
    if (err.code === "VALIDATION_ERROR") {
      return res.status(400).json({
        ok: false,
        message: err.message
      });
    }
    console.error("❌ Error inesperado al actualizar talle:", err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}


// 5. DELETE /talles/:id
export async function deleteTalle(req, res, next) {
  try {
    const deleted = await talleService.deleteTalle(req.params.id);
    if (deleted) {
      return res.status(200).json({
        ok: true,
        message: "Talle eliminado correctamente"
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Talle no encontrado"
      });
    }
  } catch (err) {
    next(err);
  }
}
