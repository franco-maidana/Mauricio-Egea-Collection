import { Router } from "express";
import * as ImagenesController from "../../controller/imagenes.controller.js";
import uploadGaleria from "../../config/uploadGaleria.js";

const imagenesGaleria = Router();

// 🔹 Subir imagen a la galería
imagenesGaleria.post("/subir", uploadGaleria.single("imagen"), ImagenesController.addImagen );

// 🔹 Listar imágenes de un producto
imagenesGaleria.get("/:productoId", ImagenesController.getImagenes);

// 🔹 Eliminar una imagen por ID
imagenesGaleria.delete("/:id", ImagenesController.deleteImagen);

// 🔹 Eliminar todas las imágenes de un producto
imagenesGaleria.delete("/producto/:productoId", ImagenesController.deleteImagenesPorProducto);

export default imagenesGaleria;
