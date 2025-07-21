import { Router } from "express";
import { getResumenFinal } from "../../controller/checkout.controller.js";
import { requireAuthPassport, requireRolePassport } from '../../middlewares/auth.middleware.js';

const checkout = Router();

checkout.get("/:userId/:direccionId", requireAuthPassport, requireRolePassport('admin', 'cliente'), getResumenFinal);

export default checkout;
