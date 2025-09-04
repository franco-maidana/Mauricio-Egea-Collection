import * as ImagenesModel from "../models/imagenes.model.js";

// 🔹 Listar imágenes por producto
export async function listarImagenesPorProducto(productoId) {
  return await ImagenesModel.getImagenesPorProducto(productoId);
}

// 🔹 Crear nueva imagen
export async function crearImagen(productoId, colorId, url) {
  return await ImagenesModel.addImagenProducto(productoId, colorId, url);
}

// 🔹 Eliminar una imagen por ID
export async function eliminarImagenPorId(id) {
  return await ImagenesModel.deleteImagenPorId(id);
}

// 🔹 Eliminar todas las imágenes de un producto
export async function eliminarImagenesPorProducto(productoId) {
  return await ImagenesModel.deleteImagenesPorProducto(productoId);
}
