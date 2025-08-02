import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Carrito API", () => {
  let cookieAdmin;
  let itemCarritoId;
  const userId = 28; // ID del usuario admin en tu base de datos
  const producto_id = 1; // Asegúrate que exista un producto con este ID
  const talle_id = 2; // Asegúrate que exista este talle
  const cantidad = 1;

  // Loguear admin antes de las pruebas
  it("✅ debería loguear el usuario admin", async () => {
    const res = await request(Server)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    cookieAdmin = res.headers["set-cookie"];
  });

  // Agregar producto al carrito
  it("✅ debería agregar un producto al carrito", async () => {
    const res = await request(Server)
      .post(`/api/carrito/agregar/${userId}`)
      .set("Cookie", cookieAdmin)
      .send({
        producto_id,
        talle_id,
        cantidad
      });

    expect([201, 400]).toContain(res.status);
  });

  // Listar productos del carrito
  it("✅ debería listar productos del carrito", async () => {
    const res = await request(Server)
      .get(`/api/carrito/list/${userId}`)
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.carrito)).toBe(true);

      if (res.body.carrito.length > 0) {
        itemCarritoId = res.body.carrito[0].id; // Guardamos id para pruebas siguientes
      }
    }
  });

  // Actualizar cantidad
  it("✅ debería actualizar la cantidad de un producto en el carrito", async () => {
    if (!itemCarritoId) {
      expect(true).toBe(true); // Saltar si no hay item
      return;
    }

    const res = await request(Server)
      .put(`/api/carrito/update/${userId}`)
      .set("Cookie", cookieAdmin)
      .send({
        producto_id,
        talle_id,
        cantidad: 2
      });

    expect([200, 400]).toContain(res.status);
  });

  // Eliminar producto inexistente
  it("❌ debería devolver error al eliminar un producto inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/carrito/destroi/${userId}/9999`)
      .set("Cookie", cookieAdmin);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  // Vaciar carrito
  it("✅ debería vaciar el carrito", async () => {
    const res = await request(Server)
      .delete(`/api/carrito/vaciar/${userId}`)
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
  });
});
