import Conexion from '../config/db.js';

// 1. Obtener todos los talles y stock para un producto
export const getStockPorProducto = async (id_producto) => {
  const [rows] = await Conexion.query(
    `SELECT s.talle_id, t.etiqueta, s.color_id, c.nombre AS color, s.stock
     FROM stock_por_producto_talle s
     JOIN talles t ON s.talle_id = t.talle_id
     JOIN colores c ON s.color_id = c.id
     WHERE s.id_producto = ?`,
    [id_producto]
  );
  return rows;
};


// 2. Obtener stock de un producto y un talle específico
export const getStockPorProductoYTalle = async (id_producto, talle_id) => {
  const [rows] = await Conexion.query(
    `SELECT stock
     FROM stock_por_producto_talle
     WHERE id_producto = ? AND talle_id = ?`,
    [id_producto, talle_id]
  );
  return rows[0]; // undefined si no existe
};

// 3. Crear (o setear) stock para producto+talle (inserta si no existe)
export const setStock = async (id_producto, talle_id, stock) => {
  // Intentamos hacer INSERT, si falla por duplicado hacemos UPDATE
  try {
    await Conexion.query(
      `INSERT INTO stock_por_producto_talle (id_producto, talle_id, stock) VALUES (?, ?, ?)`,
      [id_producto, talle_id, stock]
    );
    return true;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // Ya existe, hacemos update
      await Conexion.query(
        `UPDATE stock_por_producto_talle SET stock = ? WHERE id_producto = ? AND talle_id = ?`,
        [stock, id_producto, talle_id]
      );
      return true;
    }
    throw err;
  }
};

// 4. Actualizar stock (sumar/restar, o poner valor exacto)
export const updateStock = async (id_producto, talle_id, stock) => {
  const [result] = await Conexion.query(
    `UPDATE stock_por_producto_talle SET stock = ? WHERE id_producto = ? AND talle_id = ?`,
    [stock, id_producto, talle_id]
  );
  return result.affectedRows;
};

// 5. Eliminar combinación (opcional)
export const deleteStock = async (id_producto, talle_id) => {
  const [result] = await Conexion.query(
    `DELETE FROM stock_por_producto_talle WHERE id_producto = ? AND talle_id = ?`,
    [id_producto, talle_id]
  );
  return result.affectedRows;
};

// Listar stock de todos los productos (producto + color + talle)
export const getStockTodosProductos = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;

  const [rows] = await Conexion.query(
    `SELECT 
       s.id_producto,
       p.nombre       AS producto,
       s.color_id,
       c.nombre       AS color,
       s.talle_id,
       t.etiqueta     AS talle,
       s.stock
     FROM stock_por_producto_talle s
     JOIN productos p ON p.id_producto = s.id_producto
     JOIN talles    t ON t.talle_id    = s.talle_id
     JOIN colores   c ON c.id          = s.color_id
     ORDER BY p.nombre, c.nombre, t.etiqueta
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );

  const [[{ total }]] = await Conexion.query(
    `SELECT COUNT(*) AS total FROM stock_por_producto_talle`
  );

  return { rows, total };
};
