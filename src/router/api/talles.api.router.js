import { Router } from "express";
import * as talleController from '../../controller/talle.controller.js';

const talles = Router();

// 1. POST - http://localhost:8080/api/talles/create
talles.post('/create', talleController.createTalle);

// 2. GET - http://localhost:8080/api/talles/list
talles.get('/list', talleController.getTalles);

//    GET - http://localhost:8080/api/talles/list/:id
talles.get('/list/:id', talleController.getTalleById);

// 3. PUT - http://localhost:8080/api/talles/update/:id
talles.put('/update/:id', talleController.updateTalle);

// 4. DELETE - http://localhost:8080/api/talles/destroi/:id
talles.delete('/destroi/:id', talleController.deleteTalle);

export default talles;
