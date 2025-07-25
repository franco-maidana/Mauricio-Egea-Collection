// service/checkout.service.js
import Conexion from "../config/db.js";
import { getCarritoByUserConTotal } from "./carrito.service.js";

export async function resumenFinalPorUsuario(userId) {
  // Buscar la última dirección cargada por el usuario
  const [dirs] = await Conexion.execute(
    "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId]
  );
  if (!dirs.length) {
    throw new Error("No tiene direcciones cargadas");
  }
  const direccion = dirs[0];

  // Obtener productos y total actual del carrito
  const { productos, subtotal, costoPlataforma, total } = await getCarritoByUserConTotal(userId);

  // Buscar costo de envío de la provincia de esa dirección
  const provinciaId = direccion.provincia_id;
  const [prov] = await Conexion.execute(
    "SELECT costo_envio FROM provincias WHERE id = ?",
    [provinciaId]
  );
  if (!prov.length) throw new Error("Provincia no encontrada");

  const costoEnvio = Number(prov[0].costo_envio);

  // Total final
  const totalFinal = total + costoEnvio;

  // Devuelvo el resumen como objeto
  return {
    productos,
    subtotal,
    costoPlataforma,
    costoEnvio,
    total: totalFinal
  };
}
