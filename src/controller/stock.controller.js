import * as stockService from "../service/stock.service.js";

// Listar todos los talles y stock de un producto
export async function getStockPorProducto(req, res, next) {
  try {
    const result = await stockService.getStockPorProducto(req.params.id_producto);
    return res.status(200).json({
      ok: true,
      message: "Stock por producto",
      data: result
    });
  } catch (err) {
    next(err);
  }
}

// Obtener stock para producto+talle específico
export async function getStockPorProductoYTalle(req, res, next) {
  try {
    const { id_producto, talle_id } = req.params;
    const result = await stockService.getStockPorProductoYTalle(id_producto, talle_id);
    if (result) {
      return res.status(200).json({
        ok: true,
        message: "Stock encontrado",
        data: result
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "No hay stock para esa combinación"
      });
    }
  } catch (err) {
    next(err);
  }
}

// Crear/Setear stock para producto+talle
export async function setStock(req, res, next) {
  try {
    const { id_producto, talle_id, stock } = req.body;
    const resultado = await stockService.setStock(id_producto, talle_id, Number(stock));
    return res.status(201).json({
      ok: true,
      message: "Stock seteado correctamente",
      data: { id_producto, talle_id, stock },
      alerta: resultado.alerta // Puede ser 'BAJO', 'CRITICO' o null
    });
  } catch (err) {
    if (err.code === "INVALID_STOCK") {
      return res.status(400).json({ ok: false, message: err.message });
    }
    next(err);
  }
}

// Actualizar stock para producto+talle
export async function updateStock(req, res, next) {
  try {
    const { id_producto, talle_id } = req.params;
    const { stock } = req.body;
    const resultado = await stockService.updateStock(id_producto, talle_id, Number(stock));
    return res.status(200).json({
      ok: true,
      message: "Stock actualizado correctamente",
      data: { id_producto, talle_id, stock },
      alerta: resultado.alerta
    });
  } catch (err) {
    if (err.code === "INVALID_STOCK") {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ ok: false, message: err.message });
    }
    next(err);
  }
}

// Eliminar combinación producto+talle
export async function deleteStock(req, res, next) {
  try {
    const { id_producto, talle_id } = req.params;
    const deleted = await stockService.deleteStock(id_producto, talle_id);
    if (deleted) {
      return res.status(200).json({
        ok: true,
        message: "Stock eliminado correctamente"
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: "Combinación producto+talle no encontrada"
      });
    }
  } catch (err) {
    next(err);
  }
}
