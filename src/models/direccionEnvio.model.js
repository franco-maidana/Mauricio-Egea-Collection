import Conexion from "../config/db.js";

// Crear una dirección de envío
export const crearDireccionEnvio = async (userId, datos) => {
  const { direccion, ciudad, provincia_id, cp, telefono, referencia } = datos;
  const [result] = await Conexion.execute(
    `INSERT INTO direcciones_envio 
      (user_id, direccion, ciudad, provincia_id, cp, telefono, referencia) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, direccion, ciudad, provincia_id, cp, telefono, referencia]
  );
  return result.insertId;
};

// Listar direcciones de un usuario
export const obtenerTodasLasDirecciones = async (page = 1, limit = 5) => {
  // Forzá los valores acá también
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

  const [[{ total }]] = await Conexion.query(
    'SELECT COUNT(*) as total FROM direcciones_envio'
  );

  return { direcciones: rows, total };
};


// Obtener una dirección por ID (y usuario, para seguridad)
export const obtenerDireccionPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("El id de la dirección es requerido y debe ser numérico");
  }

  const [rows] = await Conexion.execute(
    `SELECT de.*, u.email, u.name, p.nombre AS provincia
       FROM direcciones_envio de
       JOIN users u ON de.user_id = u.id
       JOIN provincias p ON de.provincia_id = p.id
     WHERE de.id = ?`,
    [id]
  );

  return rows[0] || null;
};


// Actualizar una dirección
export const actualizarDireccionEnvio = async (id, userId, datos) => {
  // Validar id y userId
  if (!id || isNaN(id)) throw new Error("ID inválido");
  if (!userId || isNaN(userId)) throw new Error("UserID inválido");

  let campos = [];
  let valores = [];

  if (datos.direccion !== undefined && datos.direccion.trim() !== "") {
    campos.push("direccion = ?");
    valores.push(datos.direccion.trim());
  }
  if (datos.ciudad !== undefined && datos.ciudad.trim() !== "") {
    campos.push("ciudad = ?");
    valores.push(datos.ciudad.trim());
  }
  if (datos.provincia_id !== undefined && datos.provincia_id !== "") {
    campos.push("provincia_id = ?");
    valores.push(datos.provincia_id);
  }
  if (datos.cp !== undefined && datos.cp !== "") {
    campos.push("cp = ?");
    valores.push(datos.cp);
  }
  if (datos.telefono !== undefined && datos.telefono !== "") {
    campos.push("telefono = ?");
    valores.push(datos.telefono);
  }
  if (datos.referencia !== undefined && datos.referencia.trim() !== "") {
    campos.push("referencia = ?");
    valores.push(datos.referencia.trim());
  }

  if (campos.length === 0) {
    // Nada para actualizar
    return 0;
  }

  valores.push(id, userId);
  const sql = `UPDATE direcciones_envio SET ${campos.join(", ")} WHERE id = ? AND user_id = ?`;
  const [result] = await Conexion.execute(sql, valores);
  return result.affectedRows;
};

// Eliminar una dirección (del propio usuario)
export const eliminarDireccionEnvio = async (id, userId) => {
  const [result] = await Conexion.execute(
    `DELETE FROM direcciones_envio WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return result.affectedRows;
};
