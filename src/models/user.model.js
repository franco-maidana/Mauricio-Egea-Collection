import Conexion from '../config/db.js';

export const getAllUsers = async () => {
  const [rows] = await Conexion.query('SELECT * FROM users');
  return rows;
};

export const getAllUsersPaginated = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  const [rows] = await Conexion.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset]);
  const [[{ total }]] = await Conexion.query('SELECT COUNT(*) as total FROM users');
  return { users: rows, total };
};

export const getUserById = async (id) => {
  const [rows] = await Conexion.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const getUserByEmail = async (email) => {
  const [rows] = await Conexion.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ name, last_name, email, password_hash, avatar_url }) => {
  const [result] = await Conexion.query(
    'INSERT INTO users (name, last_name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?, ?)',
    [name, last_name, email, password_hash, avatar_url]
  );
  return result.insertId;
};


// UPDATE DINÁMICO — solo campos enviados y no vacíos
export const updateUser = async (id, datos) => {
  const campos = [];
  const valores = [];

  if (datos.name && datos.name.trim() !== "") {
    campos.push("name = ?");
    valores.push(datos.name);
  }
  if (datos.last_name && datos.last_name.trim() !== "") {
    campos.push("last_name = ?");
    valores.push(datos.last_name);
  }
  if (datos.email && datos.email.trim() !== "") {
    campos.push("email = ?");
    valores.push(datos.email);
  }
  if (datos.password_hash && datos.password_hash.trim() !== "") {
    campos.push("password_hash = ?");
    valores.push(datos.password_hash);
  }
  if (datos.avatar_url && datos.avatar_url.trim() !== "") {
    campos.push("avatar_url = ?");
    valores.push(datos.avatar_url);
  }
  // Agregas el rol
  if (datos.role && ["cliente", "admin", "tesorero"].includes(datos.role)) {
    campos.push("role = ?");
    valores.push(datos.role);
  }

  if (campos.length === 0) {
    return 0;
  }

  valores.push(id);
  const sql = `UPDATE users SET ${campos.join(", ")} WHERE id = ?`;
  const [result] = await Conexion.query(sql, valores);
  return result.affectedRows;
};

export async function updateUserGoogle(id, data) {
  const fields = [];
  const values = [];

  // Permití solo google_id y opcionalmente avatar_url si querés
  if (data.google_id !== undefined) {
    fields.push("google_id = ?");
    values.push(data.google_id);
  }
  if (data.avatar_url) {
    fields.push("avatar_url = ?");
    values.push(data.avatar_url);
  }

  if (fields.length === 0) return 0;

  values.push(id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await Conexion.query(sql, values);
  return result.affectedRows;
}

export const deleteUser = async (id) => {
  const [result] = await Conexion.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows;
};

// Buscar usuario por Google ID
export async function getUserByGoogleId(googleId) {
  const [rows] = await Conexion.execute(
    "SELECT * FROM users WHERE google_id = ?",
    [googleId]
  );
  return rows[0];
}

export const createUserGoogle = async ({ name, last_name, email, avatar_url, google_id }) => {
  const [result] = await Conexion.query(
    'INSERT INTO users (name, last_name, email, avatar_url, google_id) VALUES (?, ?, ?, ?, ?)',
    [name, last_name, email, avatar_url, google_id]
  );
  return result.insertId;
};

// Quitar google_id (desvincular Google)
export async function unlinkGoogleAccount(userId) {
  const [result] = await Conexion.query(
    "UPDATE users SET google_id = NULL WHERE id = ?",
    [userId]
  );
  return result.affectedRows;
}
