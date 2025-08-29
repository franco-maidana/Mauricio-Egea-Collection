import { Router } from "express";
import {listarPromociones} from '../../controller/promo.controller.js'

const promociones = Router()


promociones.get("/promociones", listarPromociones);

export default promociones