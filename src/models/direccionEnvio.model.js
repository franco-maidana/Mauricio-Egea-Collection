import Conexion from "../config/db.js";

// Crear una dirección de envío
export const crearDireccionEnvio = async (userId, datos) => {
  const [result] = await Conexion.execute(
    `INSERT INTO direcciones_envio 
      (user_id, direccion, ciudad, provincia_id, cp, telefono, referencia) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      datos.direccion,
      datos.ciudad,
      datos.provincia_id,
      datos.cp || null,
      datos.telefono || null,
      datos.referencia || null
    ]
  );
  return result.insertId;
};

// Listar todas las direcciones (con paginación)
export const obtenerTodasLasDirecciones = async (page = 1, limit = 5) => {
  const pag = parseInt(page) || 1;
  const lim = parseInt(limit) || 5;
  const offset = (pag - 1) * lim;

  const [rows] = await Conexion.query(
    `SELECT de.*, u.email, u.name, p.nombre AS provincia
     FROM direcciones_envio de
     JOIN users u ON de.user_id = u.id
     JOIN provincias p ON de.provincia_id = p.id
     ORDER BY de.id DESC
     LIMIT ? OFFSET ?`,
    [lim, offset]
  );

  return rows;
};

// Obtener una dirección por ID (opcionalmente filtrada por usuario)
export const obtenerDireccionPorId = async (id, userId = null) => {
  if (!id || isNaN(id)) {
    throw new Error("El id de la dirección es requerido y debe ser numérico");
  }

  let sql = `
    SELECT de.*, u.email, u.name, p.nombre AS provincia
    FROM direcciones_envio de
    JOIN users u ON de.user_id = u.id
    JOIN provincias p ON de.provincia_id = p.id
    WHERE de.id = ?`;
  const params = [id];

  if (userId) {
    sql += " AND de.user_id = ?";
    params.push(userId);
  }

  const [rows] = await Conexion.execute(sql, params);
  return rows[0] || null;
};

// Actualizar una dirección
export const actualizarDireccionEnvio = async (id, userId, datos) => {
  if (!id || isNaN(id)) throw new Error("ID inválido");
  if (!userId || isNaN(userId)) throw new Error("UserID inválido");

  const campos = [];
  const valores = [];

  if (datos.direccion?.trim()) {
    campos.push("direccion = ?");
    valores.push(datos.direccion.trim());
  }
  if (datos.ciudad?.trim()) {
    campos.push("ciudad = ?");
    valores.push(datos.ciudad.trim());
  }
  if (datos.provincia_id !== undefined && datos.provincia_id !== "") {
    campos.push("provincia_id = ?");
    valores.push(datos.provincia_id);
  }
  if (datos.cp) {
    campos.push("cp = ?");
    valores.push(datos.cp);
  }
  if (datos.telefono) {
    campos.push("telefono = ?");
    valores.push(datos.telefono);
  }
  if (datos.referencia?.trim()) {
    campos.push("referencia = ?");
    valores.push(datos.referencia.trim());
  }

  if (campos.length === 0) {
    return 0; // Nada para actualizar
  }

  valores.push(id, userId);
  const sql = `UPDATE direcciones_envio SET ${campos.join(", ")} WHERE id = ? AND user_id = ?`;
  const [result] = await Conexion.execute(sql, valores);
  return result.affectedRows;
};

// Eliminar una dirección
export const eliminarDireccionEnvio = async (id, userId) => {
  const [result] = await Conexion.execute(
    `DELETE FROM direcciones_envio WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return result.affectedRows;
};

// Obtener todas las direcciones de un usuario (sin paginación)
export const obtenerDireccionesPorUsuario = async (userId) => {
  const [rows] = await Conexion.execute(
    "SELECT * FROM direcciones_envio WHERE user_id = ?",
    [userId]
  );
  return rows;
};
