import * as productoService from "../service/producto.service.js";

// 1. POST /productos
export async function createProducto(req, res, next) {
  try {
    const data = req.body;
    // Si viene archivo (imagen), guardar URL de Cloudinary
    if (req.file && req.file.path) {
      data.imagen_url = req.file.path; // Multer + Cloudinary ya suben y dejan el URL acá
    }

    const productoId = await productoService.createProducto(data);
    if (productoId) {
      const producto = await productoService.findProductoById(productoId);
      return res.status(201).json({
        ok: true,
        message: "Producto creado correctamente",
        data: producto,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "No se pudo crear el producto"
      });
    }
  } catch (err) {
    if (err.code === "DUPLICATE_PRODUCTO") {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un producto con ese nombre en la misma categoría."
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

// 2. GET /productos
export async function getProductos(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const categoria_id = req.query.categoria_id || null;
    const sort = req.query.sort || "nombre";
    const order = req.query.order || "asc";

    const { productos, total } = await productoService.listProductosFiltrados({
      categoria_id,
      page,
      limit,
      sort,
      order
    });

    const totalPages = Math.ceil(total / limit);

    if (productos && productos.length > 0) {
      return res.status(200).json({
        ok: true,
        message: 'Productos encontrados',
        data: productos,
        pagination: { page, perPage: limit, total, totalPages }
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: 'No se encontraron productos'
      });
    }
  } catch (err) {
    next(err);
  }
}

// 3. GET /productos/:id
export async function getProductoById(req, res, next) {
  try {
    const producto = await productoService.findProductoById(req.params.id);
    if (producto) {
      return res.status(200).json({
        ok: true,
        message: "Producto encontrado",
        data: producto
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }
  } catch (err) {
    next(err);
  }
}

// 4. PUT /productos/:id
export async function updateProducto(req, res, next) {
  try {
    const data = req.body;
    // Si viene una nueva imagen, actualizar imagen_url
    if (req.file && req.file.path) {
      data.imagen_url = req.file.path;
    }
    const updated = await productoService.updateProducto(req.params.id, data);
    if (updated) {
      const producto = await productoService.findProductoById(req.params.id);
      return res.status(200).json({
        ok: true,
        message: "Producto actualizado correctamente",
        data: producto,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado o sin cambios"
      });
    }
  } catch (err) {
    if (err.code === "DUPLICATE_PRODUCTO") {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un producto con ese nombre en la misma categoría."
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


// 5. DELETE /productos/:id
export async function deleteProducto(req, res, next) {
  try {
    const deleted = await productoService.deleteProducto(req.params.id);
    if (deleted) {
      return res.status(200).json({
        ok: true,
        message: "Producto eliminado correctamente"
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }
  } catch (err) {
    next(err);
  }
}

