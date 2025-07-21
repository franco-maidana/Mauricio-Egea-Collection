import { Router } from "express";
import * as talleController from '../../controller/talle.controller.js';
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const talles = Router();

// CREATE - Solo admin
talles.post('/create', requireAuthPassport, requireRolePassport('admin'), talleController.createTalle );

// LIST - Pública
talles.get('/list', talleController.getTalles);

// GET BY ID - Pública
talles.get('/list/:id', talleController.getTalleById);

// UPDATE - Solo admin
talles.put('/update/:id', requireAuthPassport, requireRolePassport('admin'), talleController.updateTalle );

// DELETE - Solo admin
talles.delete('/destroi/:id', requireAuthPassport, requireRolePassport('admin'), talleController.deleteTalle );

export default talles;
