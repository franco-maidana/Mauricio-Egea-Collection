import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// 🔹 Configuración de almacenamiento para galería de productos
const storageGaleria = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "productos/galeria", // 👈 carpeta dedicada en Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    public_id: (req, file) => {
      const name = file.originalname.split(".")[0];
      return `${name}_${Date.now()}`; // nombre original + timestamp
    },
  },
});

// 🔹 Middleware de Multer para subir imágenes de galería
const uploadGaleria = multer({ storage: storageGaleria });

export default uploadGaleria;
