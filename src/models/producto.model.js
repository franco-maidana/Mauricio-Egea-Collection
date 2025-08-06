import Conexion from '../config/db.js';

// Obtener todos los productos
export const getAllProductos = async () => {
  const [rows] = await Conexion.query('SELECT * FROM productos');
  return rows;
};

// Obtener productos paginados
export const getAllProductosPaginated = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  const [rows] = await Conexion.query('SELECT * FROM productos LIMIT ? OFFSET ?', [limit, offset]);
  const [[{ total }]] = await Conexion.query('SELECT COUNT(*) as total FROM productos');
  return { productos: rows, total };
};

// Obtener producto por ID
export const getProductoById = async (id) => {
  const [rows] = await Conexion.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
  return rows[0];
};

// Crear producto
export const createProducto = async (data) => {
  // Calcular precio_final antes de guardar
  const precio_base = Number(data.precio_base);
  const descuento = Number(data.descuento) || 0;
  const precio_final = +(precio_base - (precio_base * descuento / 100)).toFixed(2);

  const [result] = await Conexion.query(
    `INSERT INTO productos
      (nombre, imagen_url, descripcion, precio_base, descuento, categoria_id, precio_final)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.imagen_url || null,
      data.descripcion || null,
      precio_base,
      descuento,
      data.categoria_id,
      precio_final
    ]
  );
  return result.insertId;
};

// Update dinámico
export const updateProducto = async (id, data) => {
  let campos = [];
  let valores = [];

  // String vacío o undefined → no actualizar
  if (data.nombre !== undefined) {
    campos.push("nombre = ?");
    valores.push(data.nombre);
  }
  if (data.imagen_url !== undefined) {
    campos.push("imagen_url = ?");
    valores.push(data.imagen_url);
  }
  if (data.descripcion !== undefined && data.descripcion !== "") {
    campos.push("descripcion = ?");
    valores.push(data.descripcion);
  }
  if (data.precio_base !== undefined && data.precio_base !== "") {
    campos.push("precio_base = ?");
    valores.push(Number(data.precio_base));
  }
  if (data.descuento !== undefined && data.descuento !== "") {
    campos.push("descuento = ?");
    valores.push(Number(data.descuento));
  }
  if (data.categoria_id !== undefined && data.categoria_id !== "") {
    campos.push("categoria_id = ?");
    valores.push(Number(data.categoria_id));
  }

  // Solo recalcula precio_final si realmente cambia precio_base o descuento
  if ((data.precio_base !== undefined && data.precio_base !== "") ||
      (data.descuento !== undefined && data.descuento !== "")) {
    const productoActual = await getProductoById(id);
    const precio_base = data.precio_base !== undefined && data.precio_base !== "" 
      ? Number(data.precio_base) 
      : Number(productoActual.precio_base);
    const descuento = data.descuento !== undefined && data.descuento !== ""
      ? Number(data.descuento)
      : Number(productoActual.descuento);
    const precio_final = +(precio_base - (precio_base * descuento / 100)).toFixed(2);
    campos.push("precio_final = ?");
    valores.push(precio_final);
  }

  if (campos.length === 0) {
    return 0;
  }

  valores.push(id);
  const sql = `UPDATE productos SET ${campos.join(", ")} WHERE id_producto = ?`;
  const [result] = await Conexion.query(sql, valores);
  return result.affectedRows;
};

// Borrar producto
export const deleteProducto = async (id) => {
  const [result] = await Conexion.query('DELETE FROM productos WHERE id_producto = ?', [id]);
  return result.affectedRows;
};

export const getProductosByCategoria = async (categoria_id, page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  const [rows] = await Conexion.query(
    'SELECT * FROM productos WHERE categoria_id = ? LIMIT ? OFFSET ?',
    [categoria_id, limit, offset]
  );
  const [[{ total }]] = await Conexion.query(
    'SELECT COUNT(*) as total FROM productos WHERE categoria_id = ?',
    [categoria_id]
  );
  return { productos: rows, total };
};

// Nueva función para traer productos filtrados, ordenados y paginados
export const getProductosFiltrados = async ({
  categoria_id,
  page = 1,
  limit = 5,
  sort = "nombre",
  order = "asc"
}) => {
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM productos';
  let where = [];
  let params = [];

  if (categoria_id) {
    where.push('categoria_id = ?');
    params.push(categoria_id);
  }

  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  // Solo permitir estos campos para orden
  const allowedSort = ["nombre", "precio_base"];
  const allowedOrder = ["asc", "desc"];
  if (!allowedSort.includes(sort)) sort = "nombre";
  if (!allowedOrder.includes(order)) order = "asc";

  sql += ` ORDER BY ${sort} ${order}`;
  sql += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await Conexion.query(sql, params);

  // Total para paginación
  let countSql = 'SELECT COUNT(*) as total FROM productos';
  let countParams = [];
  if (where.length > 0) {
    countSql += ' WHERE ' + where.join(' AND ');
    countParams = params.slice(0, where.length);
  }
  const [[{ total }]] = await Conexion.query(countSql, countParams);

  return { productos: rows, total };
};

export const findByName = async (nombre) => {
  const [rows] = await Conexion.query(
    "SELECT * FROM productos WHERE nombre = ? LIMIT 1",
    [nombre]
  );
  return rows[0];
};

// Verificar si hay descuento global activo
export const existeDescuentoGlobal = async () => {
  const [rows] = await Conexion.query(
    `SELECT COUNT(*) AS cantidad FROM productos WHERE descuento_global_activo = 1`
  );
  return rows[0].cantidad > 0;
};

// Aplicar descuento global (tiene prioridad sobre individuales)
export const aplicarDescuentoGlobal = async (porcentaje) => {
  const factor = 1 - (porcentaje / 100);
  const [result] = await Conexion.query(
    `UPDATE productos 
     SET descuento_backup = descuento,  -- Guardar descuento actual
         descuento = ?, 
         descuento_global_activo = 1,
         precio_final = ROUND(precio_base * ?, 2)`,
    [porcentaje, factor]
  );
  return result.affectedRows;
};


// Quitar descuento global (volver a los individuales)
export const quitarDescuentoGlobal = async () => {
  const [result] = await Conexion.query(
    `UPDATE productos 
     SET descuento = descuento_backup,  -- Restaurar el descuento original
         descuento_backup = 0,
         descuento_global_activo = 0,
         precio_final = 
           CASE 
             WHEN descuento_backup > 0 THEN ROUND(precio_base - (precio_base * descuento_backup / 100), 2)
             ELSE precio_base
           END`
  );
  return result.affectedRows;
};

