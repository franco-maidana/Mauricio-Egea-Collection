import * as ordenDetalleModel from '../models/detalleOrden.model.js';

// Insertar un detalle (línea de producto) en la orden
export async function insertarDetalleEnOrden(detalle) {
  return await ordenDetalleModel.insertarDetalle(detalle);
}

// Obtener todos los detalles de una orden
export async function obtenerDetallePorOrden(orden_id) {
  return await ordenDetalleModel.getDetallePorOrden(orden_id);
}