import Conexion from "../config/db.js";

export const obtenerOrdenParaPDF = async (ordenId) => {
  // 1. Traer datos de la orden, el usuario y la dirección
  const [[orden]] = await Conexion.execute(`
    SELECT o.numero_orden, o.fecha, o.total,
           u.name, u.last_name, u.email, d.direccion, d.ciudad, d.cp, d.telefono
    FROM ordenes o
    JOIN users u ON o.user_id = u.id
    JOIN direcciones_envio d ON o.direccion_envio_id = d.id
    WHERE o.id = ?
  `, [ordenId]);

  // 2. Traer los productos comprados en esa orden
  const [productos] = await Conexion.execute(`
    SELECT od.nombre_producto AS nombre, od.cantidad, od.precio_unitario
    FROM ordenes_detalle od
    WHERE od.orden_id = ?
  `, [ordenId]);

  // 3. Calcular subtotal (precio * cantidad)
  const subtotal = productos.reduce((acc, p) => acc + (p.precio_unitario * p.cantidad), 0);

  return {
    id: ordenId,
    numero_orden: orden.numero_orden,
    usuario_nombre: `${orden.name} ${orden.last_name}`,
    usuario_email: orden.email,
    telefono: orden.telefono,
    direccion_envio: orden.direccion,
    ciudad: orden.ciudad,
    cp: orden.cp,
    productos,
    subtotal,
    envio: orden.total - subtotal,
    total: orden.total,
  };
};
