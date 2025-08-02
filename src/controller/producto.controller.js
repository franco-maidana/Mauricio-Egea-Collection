import * as productoService from "../service/producto.service.js";

// 1. POST /productos
export const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_base, descuento, categoria_id } = req.body;

    // Validar campos obligatorios
    if (!nombre || !precio_base || !categoria_id) {
      return res.status(400).json({ ok: false, message: "Nombre, precio_base y categoría son obligatorios" });
    }

    // Verificar duplicado por nombre y categoría
    const existe = await productoService.findProductoByNombreYCategoria(nombre, categoria_id);
    if (existe) {
      return res.status(409).json({ ok: false, message: "El producto ya existe en esa categoría" });
    }

    // Crear producto
    const nuevoProductoId = await productoService.createProducto({
      nombre,
      descripcion,
      precio_base,
      descuento,
      categoria_id,
      imagen_url: req.file?.path || null
    });

    return res.status(201).json({
      ok: true,
      message: "Producto creado correctamente",
      data: nuevoProductoId
    });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// 📌 Obtener producto por ID
export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.findProductoById(id);

    if (!producto) {
      return res.status(404).json({ ok: false, message: "Producto no encontrado" });
    }

    return res.status(200).json({ ok: true, data: producto });
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// 📌 Listar productos
export const getAllProductos = async (req, res) => {
  try {
    const productos = await productoService.listProductos();

    return res.status(200).json({
      ok: true,
      data: productos
    });
  } catch (error) {
    console.error("❌ Error al listar productos:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

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

