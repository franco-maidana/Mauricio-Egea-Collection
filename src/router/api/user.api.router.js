import { Router } from "express";
import * as userController from '../../controller/user.controller.js'
import upload from '../../config/multer.js'

const users = Router()

// 1. POST - http://localhost:8080/api/users/create
users.post('/create', upload.single('avatar'), userController.createUser);

// 2. GET - http://localhost:8080/api/users/list
users.get('/list', userController.getUsers);

//    GET - http://localhost:8080/api/users/list/:id
users.get('/list/:id', userController.getUserById);

//    GET - http://localhost:8080/api/users/email/:email
users.get('/email/:email', userController.getUserByEmail);

// 3. PUT - http://localhost:8080/api/users/update/:id
users.put('/update/:id', upload.single('avatar'), userController.updateUser);

// 4. DELETE - http://localhost:8080/api/users/destroi/:id
users.delete('/destroi/:id', userController.deleteUser);

export default users