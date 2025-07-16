import * as talleModel from '../models/talle.model.js';

export async function listTalles() {
  return await talleModel.getAllTalles();
}

export async function listTallesPaginated(page = 1, limit = 5) {
  return await talleModel.getAllTallesPaginated(page, limit);
}

export async function findTalleById(id) {
  return await talleModel.getTalleById(id);
}

export async function createTalle(etiqueta) {
  // Validar string no vacío
  if (!etiqueta || etiqueta.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "La etiqueta del talle es obligatoria." };
  }
  // Validar duplicado
  const existing = await talleModel.getTalleByEtiqueta(etiqueta.trim());
  if (existing) {
    throw { code: "DUPLICATE_TALLE", message: "La etiqueta del talle ya existe." };
  }
  return await talleModel.createTalle(etiqueta.trim());
}

export async function updateTalle(id, data) {
  // Validar string no vacío si se manda
  if (data.etiqueta && data.etiqueta.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "La etiqueta no puede ser vacía." };
  }
  // Si etiqueta se va a actualizar, validar duplicado
  if (data.etiqueta) {
    const existing = await talleModel.getTalleByEtiqueta(data.etiqueta.trim());
    if (existing && existing.talle_id != id) {
      throw { code: "DUPLICATE_TALLE", message: "La etiqueta del talle ya existe." };
    }
  }
  return await talleModel.updateTalle(id, data);
}

export async function deleteTalle(id) {
  return await talleModel.deleteTalle(id);
}
