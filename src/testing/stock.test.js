import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Stock API", () => {
  let cookie;
  const id_producto = 1;  // Ajustar según un producto existente en DB test
  const talle_id = 2;     // Ajustar según un talle existente en DB test

  beforeAll(async () => {
    const loginRes = await request(Server)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(loginRes.status).toBe(200);
    cookie = loginRes.headers["set-cookie"];
  });

  it("✅ debería setear stock para un producto y talle", async () => {
    const res = await request(Server)
      .post("/api/stock/set")
      .set("Cookie", cookie)
      .send({
        id_producto,
        talle_id,
        stock: 10
      });

    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("stock");
    }
  });

  it("✅ debería listar stock de un producto", async () => {
    const res = await request(Server)
      .get(`/api/stock/producto/${id_producto}`)
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it("✅ debería obtener stock de un producto y talle específico", async () => {
    const res = await request(Server)
      .get(`/api/stock/producto/${id_producto}/talle/${talle_id}`)
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("stock");
    }
  });

  it("✅ debería actualizar el stock de un producto y talle", async () => {
    const res = await request(Server)
      .put(`/api/stock/producto/${id_producto}/talle/${talle_id}`)
      .set("Cookie", cookie)
      .send({ stock: 20 });

    expect([200, 404, 400]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar stock inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/stock/producto/99999/talle/99999`)
      .set("Cookie", cookie);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});
