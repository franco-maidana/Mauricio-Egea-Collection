// service/checkout.service.js
import Conexion from "../config/db.js";
import { getCarritoByUserConTotal } from "./carrito.service.js";

export async function resumenFinalPorUsuario(userId) {
  // 1️⃣ Obtener la última dirección agregada por este usuario
  const [dirs] = await Conexion.execute(
    "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId]
  );
  if (!dirs.length) {
    throw new Error("No tiene direcciones cargadas");
  }
  const direccion = dirs[0];

  // 2️⃣ Obtener productos y subtotal del carrito
  const { productos, subtotal, total } = await getCarritoByUserConTotal(userId);

  // 3️⃣ Calcular costo de envío según provincia seleccionada
  const [prov] = await Conexion.execute(
    "SELECT costo_envio FROM provincias WHERE id = ?",
    [direccion.provincia_id]
  );
  if (!prov.length) throw new Error("Provincia no encontrada");

  const costoEnvio = Number(prov[0].costo_envio);

  // 4️⃣ Calcular total final
  const totalFinal = total + costoEnvio;

  // 5️⃣ Resumen final
  return {
    productos: productos.map(p => ({
      producto_id: p.producto_id,
      talle_id: p.talle_id ?? 0,
      nombre: p.nombre,
      imagen: p.imagen,
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario,
      subtotal: p.subtotal
    })),
    subtotal,
    costoEnvio,
    total: totalFinal
  };
}


