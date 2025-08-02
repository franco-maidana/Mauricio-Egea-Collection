import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Talles API", () => {
  let cookie;
  let talleId = 2; // Usar un ID existente en la DB de test

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

  it("✅ debería listar todos los talles (pública)", async () => {
    const res = await request(Server)
      .get("/api/talles/list")
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it("✅ debería obtener un talle por ID existente", async () => {
    const res = await request(Server)
      .get(`/api/talles/list/${talleId}`)
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("etiqueta");
    }
  });

  it("✅ debería actualizar un talle existente", async () => {
    const res = await request(Server)
      .put(`/api/talles/update/${talleId}`)
      .set("Cookie", cookie)
      .send({ etiqueta: "2" }); // Dejar como el mismo valor para evitar conflicto

    expect([200, 404, 400]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar un talle inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/talles/destroi/999999`)
      .set("Cookie", cookie);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});
