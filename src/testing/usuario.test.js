// src/testing/usuario.test.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Usuarios API", () => {
  let usuarioId;
  let cookie;

  it("✅ debería crear un usuario nuevo en la DB TEST (tolerando duplicados)", async () => {
    const timestamp = Date.now();
    const emailTest = `usuariotest${timestamp}@example.com`;

    const res = await request(Server)
      .post("/api/users/create")
      .field("name", "UsuarioTest")
      .field("last_name", "Prueba")
      .field("email", emailTest)
      .field("password", "test1234");

    // ✅ Permitimos 201 (creado) o 409 (duplicado)
    expect([201, 409]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      usuarioId = res.body.data.id;
    } else {
      // Si el usuario existe, obtenemos su ID logueando
      const findUser = await request(Server)
        .post("/api/auth/login")
        .send({
          email: emailTest,
          password: "test1234",
        });

      if (findUser.body.ok && findUser.body.user?.id) {
        usuarioId = findUser.body.user.id;
      }
    }
  });

  it("✅ debería loguear el usuario admin existente", async () => {
    const res = await request(Server)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
    cookie = res.headers["set-cookie"];
  });

  it("✅ debería listar el usuario recién creado en la DB TEST", async () => {
    expect(usuarioId).toBeDefined();

    const res = await request(Server)
      .get(`/api/users/list/${usuarioId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("email");
  });

  it("❌ debería devolver error al intentar crear un usuario duplicado (admin)", async () => {
    const res = await request(Server)
      .post("/api/users/create")
      .field("name", "Mauricio")
      .field("last_name", "Egea")
      .field("email", adminEmail)
      .field("password", "hola1234");

    expect([400, 409]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  it("❌ debería devolver error al intentar loguear con credenciales inválidas", async () => {
    const res = await request(Server)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: "clave_incorrecta",
      });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it("❌ debería devolver error al listar usuario sin cookie (no autenticado)", async () => {
    const res = await request(Server)
      .get(`/api/users/list/${usuarioId}`);

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});
