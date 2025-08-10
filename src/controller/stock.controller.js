import * as stockService from "../service/stock.service.js";

// Listar todos los talles y stock de un producto (SIN cambios)
export async function getStockPorProducto(req, res, next) {
  try {
    const result = await stockService.getStockPorProducto(req.params.id_producto);
    return res.status(200).json({ ok: true, message: "Stock por producto", data: result });
  } catch (err) { next(err); }
}

// 🔹 Obtener stock para producto + color + talle (mismo nombre)
export async function getStockPorProductoYTalle(req, res, next) {
  try {
    const { id_producto, talle_id, color_id } = req.params; // ahora lee color_id
    const result = await stockService.getStockPorProductoYTalle(id_producto, talle_id, color_id);
    if (result) {
      return res.status(200).json({ ok: true, message: "Stock encontrado", data: result });
    } else {
      return res.status(404).json({ ok: false, message: "No hay stock para esa combinación" });
    }
  } catch (err) { next(err); }
}

// 🔹 Crear/Setear stock para producto + color + talle (mismo nombre)
export async function setStock(req, res, next) {
  try {
    const { id_producto, talle_id, stock, color_id } = req.body; // ahora exige color_id
    if (id_producto == null || talle_id == null || color_id == null || stock == null) {
      return res.status(400).json({ ok: false, message: "Faltan campos: id_producto, talle_id, color_id, stock" });
    }
    const resultado = await stockService.setStock(id_producto, talle_id, Number(stock), color_id);
    return res.status(201).json({
      ok: true,
      message: "Stock seteado correctamente",
      data: { id_producto, talle_id, color_id, stock: Number(stock) },
      alerta: resultado.alerta
    });
  } catch (err) {
    if (err.code === "INVALID_STOCK") return res.status(400).json({ ok: false, message: err.message });
    next(err);
  }
}

// 🔹 Actualizar stock exacto (mismo nombre)
export async function updateStock(req, res, next) {
  try {
    const { id_producto, talle_id, color_id } = req.params; // ahora incluye color_id
    const { stock } = req.body;
    const resultado = await stockService.updateStock(id_producto, talle_id, Number(stock), color_id);
    return res.status(200).json({
      ok: true,
      message: "Stock actualizado correctamente",
      data: { id_producto, talle_id, color_id, stock: Number(stock) },
      alerta: resultado.alerta
    });
  } catch (err) {
    if (err.code === "INVALID_STOCK") return res.status(400).json({ ok: false, message: err.message });
    if (err.code === "NOT_FOUND")   return res.status(404).json({ ok: false, message: err.message });
    next(err);
  }
}

// 🔹 Eliminar combinación producto + color + talle (mismo nombre)
export async function deleteStock(req, res, next) {
  try {
    const { id_producto, talle_id, color_id } = req.params; // ahora incluye color_id
    const deleted = await stockService.deleteStock(id_producto, talle_id, color_id);
    if (deleted) return res.status(200).json({ ok: true, message: "Stock eliminado correctamente" });
    return res.status(404).json({ ok: false, message: "Combinación producto+color+talle no encontrada" });
  } catch (err) { next(err); }
}

// Listar stock de TODOS los productos (SIN cambios)
export async function getStockTodosProductos(req, res, next) {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 50;
    const { rows, total } = await stockService.getStockTodosProductos(page, limit);
    return res.status(200).json({ ok: true, message: "Stock de todos los productos", data: rows, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}
