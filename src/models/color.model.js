import Conexion from "../config/db.js";

// Crear color
export const crearColor = async (nombre) => {
  const [result] = await Conexion.execute(
    "INSERT INTO colores (nombre) VALUES (?)",
    [nombre]
  );
  return { id: result.insertId, nombre };
};

// Listar colores
export const obtenerColores = async () => {
  const [rows] = await Conexion.execute("SELECT * FROM colores ORDER BY id DESC");
  return rows;
};

// Modificar color
export const actualizarColor = async (id, nombre) => {
  const [result] = await Conexion.execute(
    "UPDATE colores SET nombre = ? WHERE id = ?",
    [nombre, id]
  );
  return result.affectedRows;
};

// Eliminar color
export const eliminarColor = async (id) => {
  const [result] = await Conexion.execute(
    "DELETE FROM colores WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};
