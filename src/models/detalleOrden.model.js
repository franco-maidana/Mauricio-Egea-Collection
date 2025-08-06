// models/detalleOrden.model.js
import Conexion from '../config/db.js';

export async function insertarDetalle({
  orden_id,
  producto_id,
  talle_id,
  cantidad,
  precio_unitario,
  subtotal,
  nombre_producto,
  imagen_url
}) {
  await Conexion.execute(
    `INSERT INTO ordenes_detalle 
      (orden_id, producto_id, talle_id, cantidad, precio_unitario, subtotal, nombre_producto, imagen_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [orden_id, producto_id, talle_id, cantidad, precio_unitario, subtotal, nombre_producto, imagen_url]
  );
}

export async function getDetallePorOrden(orden_id) {
  const [rows] = await Conexion.query(
    `SELECT * FROM ordenes_detalle WHERE orden_id = ? ORDER BY id ASC`,
    [orden_id]
  );
  return rows;
}
