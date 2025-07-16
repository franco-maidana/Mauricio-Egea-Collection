import * as categoriaService from "../service/categoria.service.js";

// 1. POST /categorias
export async function createCategoria(req, res, next) {
  try {
    const { nombre } = req.body;
    const categoria = await categoriaService.createCategoria(nombre);
    if (categoria) {
      res.status(201).json({
        ok: true,
        message: "Categoría creada correctamente",
        data: { categoria_id: categoria, nombre }
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "No se pudo crear la categoría"
      });
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "El nombre de la categoría ya existe"
      });
    }
    next(err);
  }
}

// 2. GET /categorias
export async function getCategorias(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const { categorias, total } = await categoriaService.listCategoriasPaginated(page, limit);

    const totalPages = Math.ceil(total / limit);

    if (categorias && categorias.length > 0) {
      res.status(200).json({
        ok: true,
        message: 'Categorías encontradas',
        data: categorias,
        pagination: {
          page,
          perPage: limit,
          total,
          totalPages
        }
      });
    } else {
      res.status(404).json({
        ok: false,
        message: 'No se encontraron categorías'
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. GET /categorias/:id
export async function getCategoriaById(req, res, next) {
  try {
    const categoria = await categoriaService.findCategoriaById(req.params.id);
    if (categoria) {
      res.status(200).json({
        ok: true,
        message: "Categoría encontrada",
        data: categoria
      });
    } else {
      res.status(404).json({
        ok: false,
        message: "Categoría no encontrada"
      });
    }
  } catch (err) {
    next(err);
  }
}

// 4. PUT /categorias/:id
export async function updateCategoria(req, res, next) {
  try {
    const updated = await categoriaService.updateCategoria(req.params.id, req.body);
    if (updated) {
      const categoria = await categoriaService.findCategoriaById(req.params.id);
      res.status(200).json({
        ok: true,
        message: "Categoría actualizada correctamente",
        data: categoria,
      });
    } else {
      res.status(404).json({
        ok: false,
        message: "Categoría no encontrada o sin cambios"
      });
    }
  } catch (err) {
    next(err);
  }
}

// 5. DELETE /categorias/:id
export async function deleteCategoria(req, res, next) {
  try {
    const deleted = await categoriaService.deleteCategoria(req.params.id);
    if (deleted) {
      res.status(200).json({
        ok: true,
        message: "Categoría eliminada correctamente"
      });
    } else {
      res.status(404).json({
        ok: false,
        message: "Categoría no encontrada"
      });
    }
  } catch (err) {
    next(err);
  }
}
