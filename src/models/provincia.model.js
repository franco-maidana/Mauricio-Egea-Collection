import Conexion from "../config/db.js";

// Crear una provincia
export const crearProvincia = async ({ nombre, costo_envio }) => {
  const [result] = await Conexion.execute(
    "INSERT INTO provincias (nombre, costo_envio) VALUES (?, ?)",
    [nombre, costo_envio]
  );
  return result.insertId;
};

// Obtener todas las provincias
export const listarProvincias = async () => {
  const [rows] = await Conexion.execute(
    "SELECT id, nombre, costo_envio FROM provincias ORDER BY nombre"
  );
  return rows;
};

// Obtener una provincia por ID
export const obtenerProvinciaPorId = async (id) => {
  const [rows] = await Conexion.execute(
    "SELECT id, nombre, costo_envio FROM provincias WHERE id = ?",
    [id]
  );
  return rows[0];
};

// Actualizar una provincia
export const actualizarProvincia = async (id, data) => {
  let campos = [];
  let valores = [];

  if (data.nombre !== undefined && data.nombre !== "") {
    campos.push("nombre = ?");
    valores.push(data.nombre);
  }

  if (data.costo_envio !== undefined && data.costo_envio !== "") {
    campos.push("costo_envio = ?");
    valores.push(Number(data.costo_envio));
  }

  if (campos.length === 0) {
    // No hay campos para actualizar
    return 0;
  }

  valores.push(id);
  const sql = `UPDATE provincias SET ${campos.join(", ")} WHERE id = ?`;
  const [result] = await Conexion.execute(sql, valores);
  return result.affectedRows;
};

// Eliminar una provincia
export const eliminarProvincia = async (id) => {
  const [result] = await Conexion.execute(
    "DELETE FROM provincias WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};
