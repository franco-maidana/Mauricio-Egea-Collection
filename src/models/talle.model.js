import Conexion from '../config/db.js';

// Obtener todos los talles
export const getAllTalles = async () => {
  const [rows] = await Conexion.query('SELECT * FROM talles');
  return rows;
};

// Obtener talles paginados
export const getAllTallesPaginated = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  const [rows] = await Conexion.query('SELECT * FROM talles LIMIT ? OFFSET ?', [limit, offset]);
  const [[{ total }]] = await Conexion.query('SELECT COUNT(*) as total FROM talles');
  return { talles: rows, total };
};

// Obtener talle por ID
export const getTalleById = async (id) => {
  const [rows] = await Conexion.query('SELECT * FROM talles WHERE talle_id = ?', [id]);
  return rows[0];
};

// Buscar talle por etiqueta (para evitar duplicados)
export const getTalleByEtiqueta = async (etiqueta) => {
  const [rows] = await Conexion.query('SELECT * FROM talles WHERE etiqueta = ?', [etiqueta]);
  return rows[0];
};

// Crear nuevo talle
export const createTalle = async (etiqueta) => {
  const [result] = await Conexion.query(
    'INSERT INTO talles (etiqueta) VALUES (?)',
    [etiqueta]
  );
  return result.insertId;
};

// Update dinámico (solo si envías etiqueta)
export const updateTalle = async (id, datos) => {
  const campos = [];
  const valores = [];

  if (datos.etiqueta && datos.etiqueta.trim() !== "") {
    campos.push("etiqueta = ?");
    valores.push(datos.etiqueta);
  }

  if (campos.length === 0) {
    return 0;
  }

  valores.push(id);
  const sql = `UPDATE talles SET ${campos.join(", ")} WHERE talle_id = ?`;
  const [result] = await Conexion.query(sql, valores);
  return result.affectedRows;
};

// Borrar talle
export const deleteTalle = async (id) => {
  const [result] = await Conexion.query('DELETE FROM talles WHERE talle_id = ?', [id]);
  return result.affectedRows;
};
