// service/checkout.service.js
import Conexion from "../config/db.js";
import { getCarritoByUserConTotal } from "./carrito.service.js";

export async function resumenFinalPorUsuario(userId) {
  // 1️⃣ Buscar la última dirección cargada por el usuario
  const [dirs] = await Conexion.execute(
    "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId]
  );
  if (!dirs.length) {
    throw new Error("No tiene direcciones cargadas");
  }
  const direccion = dirs[0];

  // 2️⃣ Obtener productos y total actual del carrito
  const { productos, subtotal, costoPlataforma, total } = await getCarritoByUserConTotal(userId);

  // 🔹 Asegurar que talle_id siempre esté presente
  const productosConTalle = productos.map((p) => ({
    producto_id: p.producto_id,
    talle_id: p.talle_id ?? 0, // Si por alguna razón viene null, enviamos 0
    nombre: p.nombre,
    imagen: p.imagen,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    subtotal: p.subtotal
  }));

  // 3️⃣ Buscar costo de envío de la provincia de esa dirección
  const provinciaId = direccion.provincia_id;
  const [prov] = await Conexion.execute(
    "SELECT costo_envio FROM provincias WHERE id = ?",
    [provinciaId]
  );
  if (!prov.length) throw new Error("Provincia no encontrada");

  const costoEnvio = Number(prov[0].costo_envio);

  // 4️⃣ Total final
  const totalFinal = total + costoEnvio;

  // 5️⃣ Devuelvo el resumen como objeto
  return {
    productos: productosConTalle,
    subtotal,
    costoPlataforma,
    costoEnvio,
    total: totalFinal
  };
}
