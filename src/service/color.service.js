import * as ColorModel from "../models/color.model.js";

export const crearColor = (nombre) => ColorModel.crearColor(nombre);
export const obtenerColores = () => ColorModel.obtenerColores();
export const actualizarColor = (id, nombre) => ColorModel.actualizarColor(id, nombre);
export const eliminarColor = (id) => ColorModel.eliminarColor(id);
