// /services/categoria.service.js
import * as categoriaModel from '../models/categoria.model.js';

// Listar todas las categorías
export async function listCategorias() {
  return await categoriaModel.getAllCategorias();
}

// Listar categorías paginadas
export async function listCategoriasPaginated(page = 1, limit = 5) {
  return await categoriaModel.getAllCategoriasPaginated(page, limit);
}

// Buscar por ID
export async function findCategoriaById(id) {
  return await categoriaModel.getCategoriaById(id);
}

// Crear categoría
export async function createCategoria(nombre) {
  return await categoriaModel.createCategoria(nombre);
}

// Actualizar categoría
export async function updateCategoria(id, data) {
  return await categoriaModel.updateCategoria(id, data);
}

// Eliminar categoría
export async function deleteCategoria(id) {
  return await categoriaModel.deleteCategoria(id);
}
