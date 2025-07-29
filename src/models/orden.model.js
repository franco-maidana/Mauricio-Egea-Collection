import Conexion from '../config/db.js';

// Listar las órdenes de un usuario específico (historial de compras)
export const getOrdenesPorUsuario = async (user_id) => {
  const [rows] = await Conexion.query(
    `SELECT o.id, o.numero_orden, o.total, o.estado, o.created_at
      FROM ordenes o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
    [user_id]
  );
  return rows;
};

// Listar todas las órdenes (solo admin)
export const getTodasLasOrdenes = async () => {
  const [rows] = await Conexion.query(
    `SELECT o.id, o.numero_orden, o.total, o.estado, o.created_at, u.name, u.email
      FROM ordenes o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
  );
  return rows;
};

// Buscar orden por número de orden
export const getOrdenPorNumero = async (numero_orden) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM ordenes WHERE numero_orden = ?`,
    [numero_orden]
  );
  return rows[0]; // solo una orden (es único)
};

// Buscar orden por payment_id_mp
export const getOrdenPorPaymentId = async (payment_id_mp) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM ordenes WHERE payment_id_mp = ?`,
    [payment_id_mp]
  );
  return rows[0]; // solo una orden (debería ser único)
};