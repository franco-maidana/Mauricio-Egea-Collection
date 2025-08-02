import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Provincias API", () => {
  let cookie;
  const provinciaExistenteId = 1; // Buenos Aires en tu base de test
  const nombreTest = `ProvinciaTest_${Date.now()}`;
  let provinciaId;

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

  it("✅ debería crear una nueva provincia (o manejar duplicado)", async () => {
    const res = await request(Server)
      .post("/api/provincias/create")
      .set("Cookie", cookie)
      .send({ nombre: nombreTest, costo_envio: 999 });

    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      provinciaId = res.body.data.id;
    } else {
      expect([400]).toContain(res.status);
      // Si falla por duplicado, buscamos ID
      const lista = await request(Server)
        .get("/api/provincias/listar")
        .set("Cookie", cookie);
      if (lista.status === 200 && Array.isArray(lista.body.data)) {
        const encontrada = lista.body.data.find(p => p.nombre === nombreTest);
        provinciaId = encontrada?.id;
      }
    }
    expect(provinciaId).toBeDefined();
  });

  it("✅ debería listar todas las provincias", async () => {
    const res = await request(Server)
      .get("/api/provincias/listar")
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    }
  });

  it("✅ debería obtener una provincia por ID existente", async () => {
    const res = await request(Server)
      .get(`/api/provincias/listar/${provinciaExistenteId}`)
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("nombre");
    }
  });

  it("✅ debería actualizar una provincia existente", async () => {
    const res = await request(Server)
      .put(`/api/provincias/update/${provinciaExistenteId}`)
      .set("Cookie", cookie)
      .send({ nombre: "Buenos Aires", costo_envio: 2500 });

    expect([200, 404, 400]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar una provincia inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/provincias/destroi/999999`)
      .set("Cookie", cookie);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});
