import Conexion from "../config/db.js";

// 🔹 Listar todas las imágenes de un producto
export async function getImagenesPorProducto(productoId) {
  const [rows] = await Conexion.execute(
    "SELECT * FROM imagenes_producto WHERE producto_id = ?",
    [productoId]
  );
  return rows;
}

// 🔹 Insertar una nueva imagen
export async function addImagenProducto(productoId, colorId, url) {
  const [result] = await Conexion.execute(
    "INSERT INTO imagenes_producto (producto_id, color_id, imagen_url) VALUES (?, ?, ?)",
    [productoId, colorId, url]
  );
  return result.insertId;
}

// 🔹 Eliminar una imagen por ID
export async function deleteImagenPorId(id) {
  const [result] = await Conexion.execute(
    "DELETE FROM imagenes_producto WHERE id = ?",
    [id]
  );
  return result.affectedRows; // devuelve cuántas filas se borraron
}

// 🔹 Eliminar todas las imágenes de un producto
export async function deleteImagenesPorProducto(productoId) {
  const [result] = await Conexion.execute(
    "DELETE FROM imagenes_producto WHERE producto_id = ?",
    [productoId]
  );
  return result.affectedRows;
}
