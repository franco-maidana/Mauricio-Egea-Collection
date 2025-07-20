import { Router } from "express";
import * as userController from '../../controller/user.controller.js'
import upload from '../../config/multer.js'
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';


const users = Router()

// 1. POST - http://localhost:8080/api/users/create
users.post('/create', upload.single('avatar'), userController.createUser);

// 2. GET - http://localhost:8080/api/users/list
users.get('/list', requireAuthPassport, requireRolePassport('admin'), userController.getUsers);

//    GET - http://localhost:8080/api/users/list/:id
users.get('/list/:id', requireAuthPassport, requireRolePassport('admin'), userController.getUserById);

//    GET - http://localhost:8080/api/users/email/:email
users.get('/email/:email', requireAuthPassport, requireRolePassport('admin'), userController.getUserByEmail);

// 3. PUT - http://localhost:8080/api/users/update/:id
users.put('/update/:id', requireAuthPassport, upload.single('avatar'), userController.updateUser);

// 4. DELETE - http://localhost:8080/api/users/destroi/:id
users.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), userController.deleteUser);

export default users