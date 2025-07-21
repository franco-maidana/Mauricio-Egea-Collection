import { Router } from "express";
import * as categoriaController from '../../controller/categoria.controller.js';
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const categorias = Router();

// CREATE - Solo admin
categorias.post('/create', requireAuthPassport, requireRolePassport('admin'), categoriaController.createCategoria );

// LIST - Pública
categorias.get('/list', categoriaController.getCategorias);

// GET by ID - Pública
categorias.get('/list/:id', categoriaController.getCategoriaById);

// UPDATE - Solo admin
categorias.put('/update/:id', requireAuthPassport, requireRolePassport('admin'), categoriaController.updateCategoria );

// DELETE - Solo admin
categorias.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), categoriaController.deleteCategoria );

export default categorias;
