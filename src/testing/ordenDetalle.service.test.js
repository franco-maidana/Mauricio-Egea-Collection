import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect } from "vitest";
import * as detalleService from "../../src/service/ordenDetalle.service.js";
import Conexion from "../../src/config/db.js";

describe("Servicio Detalle de Órdenes", () => {
  let orden_id_existente = 1; // Ajustar a una orden existente en tu tabla ordenes
  let producto_id = 1; // Asegúrate de que exista en productos
  let talle_id = 2; // Asegúrate de que exista en talles

  it("✅ debería insertar un nuevo detalle en una orden", async () => {
    const detalle = {
      orden_id: orden_id_existente,
      producto_id,
      talle_id,
      cantidad: 2,
      precio_unitario: 1500,
      subtotal: 3000,
      nombre_producto: "Producto Test Detalle",
      imagen_url: "https://example.com/imagen.jpg"
    };

    // Intentar insertar
    await expect(detalleService.insertarDetalleEnOrden(detalle)).resolves.not.toThrow();
  });

  it("✅ debería obtener los detalles de una orden existente", async () => {
    const detalles = await detalleService.obtenerDetallePorOrden(orden_id_existente);
    expect(Array.isArray(detalles)).toBe(true);
  });

  it("❌ debería devolver array vacío para orden inexistente", async () => {
    const detalles = await detalleService.obtenerDetallePorOrden(999999);
    expect(Array.isArray(detalles)).toBe(true);
    expect(detalles.length).toBe(0);
  });
});
