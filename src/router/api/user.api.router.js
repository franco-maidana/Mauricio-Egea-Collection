import { Router } from "express";
import * as userController from '../../controller/user.controller.js'
import upload from '../../config/multer.js'
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';
import sanitize from "../../middlewares/sanitize.middleware.js";

const users = Router()

// Crear usuario (registro público)
users.post('/create', upload.single('avatar'), sanitize, userController.createUser);

// Listar todos los usuarios (solo admin)
users.get('/list', requireAuthPassport, requireRolePassport('admin'), userController.getUsers);

// Obtener usuario por ID (admin o cliente)
users.get('/list/:id', requireAuthPassport, requireRolePassport('admin', 'cliente'), userController.getUserById);

// Buscar usuario por email (solo admin)
users.get('/email/:email', requireAuthPassport, requireRolePassport('admin'), userController.getUserByEmail);

// Modificar usuario (admin o cliente)
users.put('/update/:id', requireAuthPassport, requireRolePassport('admin', 'cliente'), upload.single('avatar'), sanitize, userController.updateUser);

// Eliminar usuario (solo admin)
users.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), userController.deleteUser);

export default users;
