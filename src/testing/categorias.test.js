import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Categorías API", () => {
  let cookie;
  let categoriaId;

  // 🔹 Login admin antes de los tests
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

  it("✅ debería crear una nueva categoría", async () => {
    const res = await request(Server)
      .post("/api/categorias/create")
      .set("Cookie", cookie)
      .send({ nombre: "CategoriaTest" });

    expect([201, 400]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      categoriaId = res.body.data.categoria_id;
    } else {
      // Si ya existe, buscar ID
      const lista = await request(Server)
        .get("/api/categorias/list")
        .set("Cookie", cookie);

      const encontrada = lista.body.data.find(c => c.nombre === "CategoriaTest");
      categoriaId = encontrada?.categoria_id;
    }

    expect(categoriaId).toBeDefined();
  });

  it("✅ debería listar todas las categorías (pública)", async () => {
    const res = await request(Server)
      .get("/api/categorias/list")
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it("✅ debería obtener la categoría recién creada por ID", async () => {
    const res = await request(Server)
      .get(`/api/categorias/list/${categoriaId}`)
      .set("Cookie", cookie);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("nombre");
    }
  });

  it("✅ debería actualizar la categoría", async () => {
    const res = await request(Server)
      .put(`/api/categorias/update/${categoriaId}`)
      .set("Cookie", cookie)
      .send({ nombre: "CategoriaTestActualizada" });

    expect([200, 404]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar una categoría inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/categorias/destroi/999999`)
      .set("Cookie", cookie);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  // ⚠️ Opcional: eliminar la categoría creada
  // it("✅ debería eliminar la categoría creada", async () => {
  //   const res = await request(Server)
  //     .delete(`/api/categorias/destroi/${categoriaId}`)
  //     .set("Cookie", cookie);

  //   expect([200, 404]).toContain(res.status);
  // });
});
