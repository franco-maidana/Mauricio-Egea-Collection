import * as productoModel from '../models/producto.model.js';

// Listar todos
export async function listProductos() {
  return await productoModel.getAllProductos();
}

// Listar paginados
export async function listProductosPaginated(page = 1, limit = 5) {
  return await productoModel.getAllProductosPaginated(page, limit);
}

// Buscar por ID
export async function findProductoById(id) {
  return await productoModel.getProductoById(id);
}

// Buscar producto por nombre y categoría (para evitar duplicados)
export async function findProductoByNombreYCategoria(nombre, categoria_id) {
  const todos = await productoModel.getAllProductos();
  return todos.find(
    p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() && String(p.categoria_id) === String(categoria_id)
  );
}

// Crear producto
export async function createProducto(data) {
  if (!data.nombre || data.nombre.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "El nombre del producto es obligatorio." };
  }
  if (!data.precio_base || Number(data.precio_base) <= 0) {
    throw { code: "VALIDATION_ERROR", message: "El precio debe ser mayor a cero." };
  }
  if (!data.categoria_id) {
    throw { code: "VALIDATION_ERROR", message: "La categoría es obligatoria." };
  }

  const existente = await findProductoByNombreYCategoria(data.nombre, data.categoria_id);
  if (existente) {
    throw { code: "DUPLICATE_PRODUCTO", message: "Ya existe un producto con ese nombre en la misma categoría." };
  }

  return await productoModel.createProducto(data);
}

// Actualizar producto
export async function updateProducto(id, data) {
  if (data.nombre || data.categoria_id) {
    const productoActual = await findProductoById(id);
    const nombreNuevo = data.nombre ? data.nombre : productoActual.nombre;
    const categoriaNueva = data.categoria_id ? data.categoria_id : productoActual.categoria_id;

    const existente = await findProductoByNombreYCategoria(nombreNuevo, categoriaNueva);
    if (existente && existente.id_producto != id) {
      throw { code: "DUPLICATE_PRODUCTO", message: "Ya existe un producto con ese nombre en la misma categoría." };
    }
  }

  return await productoModel.updateProducto(id, data);
}

// Borrar producto
export async function deleteProducto(id) {
  return await productoModel.deleteProducto(id);
}

export async function listProductosByCategoria(categoria_id, page = 1, limit = 5) {
  const { productos, total } = await productoModel.getProductosByCategoria(categoria_id, page, limit);
  return {
    ok: true,
    data: {
      productos,
      total
    }
  };
}


export async function listProductosFiltrados({ categoria_id, page, limit, sort, order }) {
  return await productoModel.getProductosFiltrados({ categoria_id, page, limit, sort, order });
}

// =========================
// NUEVAS FUNCIONES DESCUENTO GLOBAL
// =========================

// Aplicar descuento global con prioridad sobre individuales
export async function aplicarDescuentoGlobal(porcentaje) {
  if (!porcentaje || porcentaje <= 0 || porcentaje > 100) {
    throw { code: "VALIDATION_ERROR", message: "El porcentaje debe ser mayor a 0 y menor o igual a 100." };
  }

  return await productoModel.aplicarDescuentoGlobal(porcentaje);
}

// Quitar descuento global y restaurar individuales
export async function quitarDescuentoGlobal() {
  const hayGlobal = await productoModel.existeDescuentoGlobal();
  if (!hayGlobal) {
    throw { code: "NO_GLOBAL_DISCOUNT", message: "No hay descuento global activo para eliminar." };
  }

  return await productoModel.quitarDescuentoGlobal();
}


// producto.service.js
export async function listProductosConDescuento() {
  return await productoModel.getProductosConDescuento();
}

export async function searchProductos(termino) {
  return await productoModel.searchProductos(termino);
}
