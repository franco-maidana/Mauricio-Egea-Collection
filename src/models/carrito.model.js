import Conexion from '../config/db.js';

// Agregar producto al carrito
export async function agregarAlCarrito({ user_id, producto_id, talle_id, color_id, cantidad }) {
  const [res] = await Conexion.query(
    `INSERT INTO carrito (user_id, producto_id, talle_id, color_id, cantidad, fecha_agregado)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [user_id, producto_id, talle_id, color_id, cantidad]
  );
  return res.insertId;
}


// Verifica si ya existe el producto+talle en el carrito del usuario
export async function existeEnCarrito({ user_id, producto_id, talle_id, color_id }) {
  const [rows] = await Conexion.query(
    `SELECT * 
       FROM carrito
      WHERE user_id = ? AND producto_id = ? AND talle_id = ? AND color_id = ?
      LIMIT 1`,
    [user_id, producto_id, talle_id, color_id]
  );
  return rows[0];
}


// Listar productos del carrito de un usuario, solo con los campos que necesitás
export const getCarritoByUser = async (user_id) => {
  const [rows] = await Conexion.query(
    `SELECT 
        c.producto_id,
        c.talle_id,
        c.color_id,
        p.nombre AS producto, 
        c.cantidad, 
        p.precio_final AS precio, 
        p.imagen_url AS imagen, 
        t.etiqueta AS talle,
        col.nombre AS color
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id_producto
      JOIN talles t ON c.talle_id = t.talle_id
      JOIN colores col ON c.color_id = col.id
      WHERE c.user_id = ?`,
    [user_id]
  );
  return rows;
};




// Actualizar la cantidad de un producto+talle en el carrito de un usuario
export const updateCantidadCarrito = async ({ user_id, producto_id, talle_id, color_id, cantidad }) => {
  const campos = [];
  const valores = [];

  // Solo si llega un valor válido de cantidad (numérico y mayor a cero)
  if (
    cantidad !== undefined &&
    cantidad !== null &&
    !isNaN(Number(cantidad)) &&
    Number(cantidad) > 0
  ) {
    campos.push("cantidad = ?");
    valores.push(Number(cantidad));
  }

  // Si no hay campos a modificar, no actualices nada
  if (campos.length === 0) {
    return 0;
  }

  valores.push(user_id, producto_id, talle_id, color_id);
  const sql = `UPDATE carrito 
                  SET ${campos.join(", ")} 
                WHERE user_id = ? AND producto_id = ? AND talle_id = ? AND color_id = ?`;
  const [result] = await Conexion.query(sql, valores);
  return result.affectedRows;
};


// Devuelve el primer registro del carrito para ese usuario y producto (sin filtrar talle)
export const getPrimeraEntradaProductoCarrito = async (user_id, producto_id, color_id) => {
  let query = `SELECT * FROM carrito WHERE user_id = ? AND producto_id = ?`;
  const params = [user_id, producto_id];
  
  if (color_id) {
    query += ` AND color_id = ?`;
    params.push(color_id);
  }
  
  query += ` LIMIT 1`;
  
  const [rows] = await Conexion.query(query, params);
  return rows[0];
};


// elimina un producto del carrito de compra 
export const deleteCarritoItemById = async (id) => {
  const [result] = await Conexion.query(
    `DELETE FROM carrito WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

export const getCarritoItemByIdAndUser = async (id, user_id) => {
  const [rows] = await Conexion.query(
    `SELECT * FROM carrito WHERE id = ? AND user_id = ?`,
    [id, user_id]
  );
  return rows[0]; // Devuelve el registro si existe y pertenece al user, sino undefined
};

// Vacía el carrito de un usuario
export const vaciarCarritoUsuario = async (user_id) => {
  const [result] = await Conexion.query(
    `DELETE FROM carrito WHERE user_id = ?`,
    [user_id]
  );
  return result.affectedRows; // cantidad de filas eliminadas
};

export const obtenerCarritoYSubtotal = async (userId) => {
  const [productos] = await Conexion.execute(
    `SELECT c.*, p.nombre, p.precio_final
     FROM carrito c
     JOIN productos p ON c.producto_id = p.id_producto
     WHERE c.user_id = ?`,
    [userId]
  );
  // Sumar el subtotal
  const subtotal = productos.reduce(
    (acum, item) => acum + Number(item.precio_final) * Number(item.cantidad),
    0
  );
  return { productos, subtotal };
};