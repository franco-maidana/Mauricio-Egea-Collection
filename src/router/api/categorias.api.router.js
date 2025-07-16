import { Router } from "express";
import * as categoriaController from '../../controller/categoria.controller.js';

const categorias = Router();

// 1. POST - http://localhost:8080/api/categorias/create
categorias.post('/create', categoriaController.createCategoria);

// 2. GET - http://localhost:8080/api/categorias/list
categorias.get('/list', categoriaController.getCategorias);

//    GET - http://localhost:8080/api/categorias/list/:id
categorias.get('/list/:id', categoriaController.getCategoriaById);

// 3. PUT - http://localhost:8080/api/categorias/update/:id
categorias.put('/update/:id', categoriaController.updateCategoria);

// 4. DELETE - http://localhost:8080/api/categorias/destroi/:id
categorias.delete('/destroi/:id', categoriaController.deleteCategoria);

export default categorias;
