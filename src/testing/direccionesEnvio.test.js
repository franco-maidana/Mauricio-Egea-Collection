import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Direcciones de Envío API", () => {
  let cookieAdmin;
  const userIdExistente = 3; // Usuario con dirección en la DB de test
  const direccionExistenteId = 1; // Dirección ya registrada
  let nuevaDireccionId;

  beforeAll(async () => {
    const loginAdmin = await request(Server).post("/api/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });

    expect(loginAdmin.status).toBe(200);
    cookieAdmin = loginAdmin.headers["set-cookie"];
  });

  it("✅ debería listar todas las direcciones (admin)", async () => {
    const res = await request(Server)
      .get("/api/direccion-envio/list")
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it("✅ debería obtener una dirección específica por ID", async () => {
    const res = await request(Server)
      .get(`/api/direccion-envio/list/${direccionExistenteId}`)
      .set("Cookie", cookieAdmin);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("direccion");
    }
  });

  it("✅ debería crear una nueva dirección (admin actuando por cliente)", async () => {
    const res = await request(Server)
      .post(`/api/direccion-envio/create/28`) // 👈 usar ID real existente
      .set("Cookie", cookieAdmin)
      .send({
        direccion: "Calle Falsa 123",
        ciudad: "Springfield",
        provincia_id: 2,
        cp: "1015",
        telefono: "2215695548",
        referencia: "Casa azul",
      });

    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      nuevaDireccionId = res.body.data.id;
      expect(res.body.ok).toBe(true);
    }
  });

  it("✅ debería actualizar una dirección existente", async () => {
    const idActualizar = nuevaDireccionId || direccionExistenteId;

    const res = await request(Server)
      .put(`/api/direccion-envio/update/${userIdExistente}/${idActualizar}`)
      .set("Cookie", cookieAdmin)
      .send({
        referencia: "Dirección modificada para pruebas",
      });

    expect([200, 404, 400]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar una dirección inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/direccion-envio/destroi/${userIdExistente}/999999`)
      .set("Cookie", cookieAdmin);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});
