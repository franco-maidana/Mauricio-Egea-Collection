import * as stockModel from '../models/stock.model.js';

// Obtener stock de un producto (todos los talles)
export async function getStockPorProducto(id_producto) {
  return await stockModel.getStockPorProducto(id_producto);
}

// Obtener stock de un producto + talle
export async function getStockPorProductoYTalle(id_producto, talle_id) {
  return await stockModel.getStockPorProductoYTalle(id_producto, talle_id);
}

// Crear o setear stock para producto+talle
export async function setStock(id_producto, talle_id, stock) {
  if (stock < 0) {
    throw { code: "INVALID_STOCK", message: "El stock no puede ser negativo." };
  }
  await stockModel.setStock(id_producto, talle_id, stock);
  // ALERTA si stock bajo
  if (stock <= 5) {
    return { alerta: stock <= 3 ? 'CRITICO' : 'BAJO', stock };
  }
  return { alerta: null, stock };
}

// Actualizar stock (update exacto)
export async function updateStock(id_producto, talle_id, stock) {
  if (stock < 0) {
    throw { code: "INVALID_STOCK", message: "El stock no puede ser negativo." };
  }
  const updated = await stockModel.updateStock(id_producto, talle_id, stock);
  if (!updated) throw { code: "NOT_FOUND", message: "Combinación no encontrada." };
  // ALERTA si stock bajo
  if (stock <= 5) {
    return { alerta: stock <= 3 ? 'CRITICO' : 'BAJO', stock };
  }
  return { alerta: null, stock };
}

// Eliminar combinación
export async function deleteStock(id_producto, talle_id) {
  return await stockModel.deleteStock(id_producto, talle_id);
}
