import * as productoService from "../service/producto.service.js";

// 1. POST /productos
export const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_base, descuento, categoria_id } = req.body;

    if (!nombre || !precio_base || !categoria_id) {
      return res.status(400).json({ ok: false, message: "Nombre, precio_base y categoría son obligatorios" });
    }

    const existe = await productoService.findProductoByNombreYCategoria(nombre, categoria_id);
    if (existe) {
      return res.status(409).json({ ok: false, message: "El producto ya existe en esa categoría" });
    }

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

// PUT /productos/descuento/global
export async function aplicarDescuentoGlobal(req, res) {
  try {
    const { porcentaje } = req.body;
    const updated = await productoService.aplicarDescuentoGlobal(porcentaje);

    return res.status(200).json({
      ok: true,
      message: `Descuento global del ${porcentaje}% aplicado a ${updated} productos`
    });
  } catch (error) {
    console.error("❌ Error al aplicar descuento global:", error);
    return res.status(400).json({ ok: false, message: error.message });
  }
}

// PUT /productos/descuento/quitar
export async function quitarDescuentoGlobal(req, res) {
  try {
    const updated = await productoService.quitarDescuentoGlobal();

    return res.status(200).json({
      ok: true,
      message: `Descuento global eliminado de ${updated} productos`
    });
  } catch (error) {
    console.error("❌ Error al quitar descuento global:", error);
    return res.status(400).json({ ok: false, message: error.message });
  }
}

// 📌 Listar productos por categoría
export async function getProductosByCategoria(req, res) {
  try {
    const { categoria_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await productoService.listProductosByCategoria(categoria_id, page, limit);
    res.json(result); // Ya incluye ok y data
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}


// producto.controller.js
export async function getProductosConDescuento(req, res) {
  try {
    const productos = await productoService.listProductosConDescuento();
    return res.status(200).json({ ok: true, data: productos });
  } catch (error) {
    console.error("❌ Error al listar productos con descuento:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

export async function buscarProductos(req, res) {
  try {
    const { termino } = req.params;
    const productos = await productoService.searchProductos(termino);
    return res.status(200).json({ ok: true, data: productos });
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}
