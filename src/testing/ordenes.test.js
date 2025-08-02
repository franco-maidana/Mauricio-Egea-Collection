import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Órdenes API", () => {
  let cookieAdmin;
  const userId = 28; // Usuario admin
  const numero_orden_existente = "ORD-20250727-2"; // Ajustar según DB
  const payment_id_existente = "1324202046"; // Ajustar según DB

  // Logueo admin
  it("✅ debería loguear el usuario admin", async () => {
    const res = await request(Server)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    cookieAdmin = res.headers["set-cookie"];
  });

  // Historial de compras del usuario (aunque sea admin)
  it("✅ debería listar las órdenes del usuario autenticado", async () => {
    const res = await request(Server)
      .get("/api/ordenes/mis-compras")
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.ordenes)).toBe(true);
    }
  });

  // Listado de todas las órdenes (admin)
  it("✅ debería listar todas las órdenes (admin)", async () => {
    const res = await request(Server)
      .get("/api/ordenes/todas")
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.ordenes)).toBe(true);
    }
  });

  // Buscar orden por número (existente o no)
  it("✅ debería buscar una orden por número", async () => {
    const res = await request(Server)
      .post("/api/ordenes/buscar/numero")
      .set("Cookie", cookieAdmin)
      .send({ numero_orden: numero_orden_existente });

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.orden).toHaveProperty("numero_orden");
    }
  });

  // Buscar orden por payment_id_mp
  it("✅ debería buscar una orden por payment_id_mp", async () => {
    const res = await request(Server)
      .post("/api/ordenes/buscar/payment")
      .set("Cookie", cookieAdmin)
      .send({ payment_id_mp: payment_id_existente });

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.orden).toHaveProperty("payment_id_mp");
    }
  });

  // Intentar buscar orden inexistente
  it("❌ debería devolver error al buscar orden inexistente", async () => {
    const res = await request(Server)
      .post("/api/ordenes/buscar/numero")
      .set("Cookie", cookieAdmin)
      .send({ numero_orden: "ORD-NO-EXISTE" });

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});
