import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storageProducto = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    public_id: (req, file) => {
      const name = file.originalname.split(".")[0];
      return `${name}_${Date.now()}`; // nombre original + timestamp
    }
  }
});

const uploadProducto = multer({ storage: storageProducto });

export default uploadProducto;
