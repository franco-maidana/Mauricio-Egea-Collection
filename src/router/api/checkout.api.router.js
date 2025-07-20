import { Router } from "express";
import { getResumenFinal } from "../../controller/checkout.controller.js";


const checkout = Router();

// GET  http://localhost:8080/api/checkout/:userId/:direccionId
checkout.get("/:userId/:direccionId", getResumenFinal);

export default checkout;
