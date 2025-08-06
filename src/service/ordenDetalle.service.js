import * as ordenDetalleModel from '../models/detalleOrden.model.js';

export async function insertarDetalleEnOrden(detalle) {
  console.log("📌 Insertando detalle normalizado:", detalle);
  return await ordenDetalleModel.insertarDetalle(detalle);
}

export async function obtenerDetallePorOrden(orden_id) {
  return await ordenDetalleModel.getDetallePorOrden(orden_id);
}
