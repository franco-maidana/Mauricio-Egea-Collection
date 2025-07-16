import Conexion from '../config/db.js';

// Obtener todas las categorías
export const getAllCategorias = async () => {
  const [rows] = await Conexion.query('SELECT * FROM categorias');
  return rows;
};

// Obtener todas paginadas
export const getAllCategoriasPaginated = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  const [rows] = await Conexion.query('SELECT * FROM categorias LIMIT ? OFFSET ?', [limit, offset]);
  const [[{ total }]] = await Conexion.query('SELECT COUNT(*) as total FROM categorias');
  return { categorias: rows, total };
};

// Obtener por ID
export const getCategoriaById = async (id) => {
  const [rows] = await Conexion.query('SELECT * FROM categorias WHERE categoria_id = ?', [id]);
  return rows[0];
};

// Crear nueva
export const createCategoria = async (nombre) => {
  const [result] = await Conexion.query(
    'INSERT INTO categorias (nombre) VALUES (?)',
    [nombre]
  );
  return result.insertId;
};

// Update dinámico (solo si envías el nombre)
export const updateCategoria = async (id, datos) => {
  const campos = [];
  const valores = [];

  if (datos.nombre && datos.nombre.trim() !== "") {
    campos.push("nombre = ?");
    valores.push(datos.nombre);
  }

  if (campos.length === 0) {
    return 0;
  }

  valores.push(id);
  const sql = `UPDATE categorias SET ${campos.join(", ")} WHERE categoria_id = ?`;
  const [result] = await Conexion.query(sql, valores);
  return result.affectedRows;
};

// Borrar categoría
export const deleteCategoria = async (id) => {
  const [result] = await Conexion.query('DELETE FROM categorias WHERE categoria_id = ?', [id]);
  return result.affectedRows;
};
