import * as ImagenesService from "../service/imagenes.service.js";

// 🔹 Obtener todas las imágenes de un producto
export async function getImagenes(req, res) {
  try {
    const { productoId } = req.params;
    const imagenes = await ImagenesService.listarImagenesPorProducto(productoId);

    res.json({ ok: true, data: imagenes });
  } catch (error) {
    console.error("❌ Error listando imágenes:", error);
    res.status(500).json({ ok: false, msg: "Error obteniendo imágenes" });
  }
}

// 🔹 Agregar nueva imagen
export async function addImagen(req, res) {
  try {
    const { producto_id, color_id } = req.body;

    // multer con Cloudinary te da la URL en req.file.path
    const imagen_url = req.file?.path; 

    if (!producto_id || !color_id || !imagen_url) {
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    // Guardar en la DB
    const id = await ImagenesService.crearImagen(producto_id, color_id, imagen_url);

    res.json({
      ok: true,
      msg: "Imagen agregada correctamente",
      id,
      url: imagen_url
    });
  } catch (error) {
    console.error("❌ Error agregando imagen:", error);
    res.status(500).json({ ok: false, msg: "Error agregando imagen" });
  }
}


// 🔹 Eliminar una imagen por ID
export async function deleteImagen(req, res) {
  try {
    const { id } = req.params;
    const result = await ImagenesService.eliminarImagenPorId(id);

    if (result > 0) {
      res.json({ ok: true, msg: "Imagen eliminada correctamente" });
    } else {
      res.status(404).json({ ok: false, msg: "Imagen no encontrada" });
    }
  } catch (error) {
    console.error("❌ Error eliminando imagen:", error);
    res.status(500).json({ ok: false, msg: "Error eliminando imagen" });
  }
}

// 🔹 Eliminar todas las imágenes de un producto
export async function deleteImagenesPorProducto(req, res) {
  try {
    const { productoId } = req.params;
    const result = await ImagenesService.eliminarImagenesPorProducto(productoId);

    if (result > 0) {
      res.json({ ok: true, msg: "Imágenes eliminadas correctamente" });
    } else {
      res.status(404).json({ ok: false, msg: "No se encontraron imágenes para este producto" });
    }
  } catch (error) {
    console.error("❌ Error eliminando imágenes por producto:", error);
    res.status(500).json({ ok: false, msg: "Error eliminando imágenes" });
  }
}
