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
  // Validar nombre, precio, categoría
  if (!data.nombre || data.nombre.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "El nombre del producto es obligatorio." };
  }
  if (!data.precio_base || Number(data.precio_base) <= 0) {
    throw { code: "VALIDATION_ERROR", message: "El precio debe ser mayor a cero." };
  }
  if (!data.categoria_id) {
    throw { code: "VALIDATION_ERROR", message: "La categoría es obligatoria." };
  }
  // Validar duplicado (nombre + categoría)
  const existente = await findProductoByNombreYCategoria(data.nombre, data.categoria_id);
  if (existente) {
    throw { code: "DUPLICATE_PRODUCTO", message: "Ya existe un producto con ese nombre en la misma categoría." };
  }

  return await productoModel.createProducto(data);
}

// Actualizar producto
export async function updateProducto(id, data) {
  // Si se va a cambiar nombre/categoría, validá duplicado
  if (data.nombre || data.categoria_id) {
    const productoActual = await findProductoById(id);
    const nombreNuevo = data.nombre ? data.nombre : productoActual.nombre;
    const categoriaNueva = data.categoria_id ? data.categoria_id : productoActual.categoria_id;

    // Si cambia alguno de los dos, chequeá duplicado
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
  return await productoModel.getProductosByCategoria(categoria_id, page, limit);
}

// Nueva función para filtrar, ordenar y paginar
export async function listProductosFiltrados({ categoria_id, page, limit, sort, order }) {
  return await productoModel.getProductosFiltrados({ categoria_id, page, limit, sort, order });
}