// service/stock.service.js
import * as stockModel from "../models/stock.model.js";

// Listar todo el stock de un producto (ya trae color en el SELECT del modelo)
export async function getStockPorProducto(id_producto) {
  return await stockModel.getStockPorProducto(id_producto);
}

// 🔹 Ahora recibe también color_id
export async function getStockPorProductoYTalle(id_producto, talle_id, color_id) {
  return await stockModel.getStockPorProductoYTalle(id_producto, talle_id, color_id);
}

// 🔹 Ahora recibe color_id (al final). Validación de stock >= 0
export async function setStock(id_producto, talle_id, stock, color_id) {
  if (Number.isNaN(Number(stock))) throw { code: "INVALID_STOCK", message: "Stock inválido." };
  if (Number(stock) < 0)           throw { code: "INVALID_STOCK", message: "El stock no puede ser negativo." };

  await stockModel.setStock(id_producto, talle_id, Number(stock), color_id);

  const alerta = Number(stock) <= 5 ? (Number(stock) <= 3 ? "CRITICO" : "BAJO") : null;
  return { alerta, stock: Number(stock) };
}

// 🔹 Ahora recibe color_id (al final)
export async function updateStock(id_producto, talle_id, stock, color_id) {
  if (Number.isNaN(Number(stock))) throw { code: "INVALID_STOCK", message: "Stock inválido." };
  if (Number(stock) < 0)           throw { code: "INVALID_STOCK", message: "El stock no puede ser negativo." };

  const updated = await stockModel.updateStock(id_producto, talle_id, Number(stock), color_id);
  if (!updated) throw { code: "NOT_FOUND", message: "Combinación no encontrada." };

  const alerta = Number(stock) <= 5 ? (Number(stock) <= 3 ? "CRITICO" : "BAJO") : null;
  return { alerta, stock: Number(stock) };
}

// 🔹 Ahora recibe color_id (al final)
export async function deleteStock(id_producto, talle_id, color_id) {
  return await stockModel.deleteStock(id_producto, talle_id, color_id);
}

// Listado paginado (sin cambios)
export async function getStockTodosProductos(page = 1, limit = 50) {
  return await stockModel.getStockTodosProductos(page, limit);
}
