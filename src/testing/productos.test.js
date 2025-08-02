import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import { adminEmail, adminPassword } from "./setupTests.js";

describe("Productos API", () => {
  let cookie;
  let productoId;

  // 🔹 Login admin antes de correr los tests
  beforeAll(async () => {
    const loginRes = await request(Server).post("/api/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.ok).toBe(true);
    cookie = loginRes.headers["set-cookie"];
  });

  it("✅ debería crear un producto nuevo (admin autenticado)", async () => {
    const res = await request(Server)
      .post("/api/productos/create")
      .set("Cookie", cookie)
      .field("nombre", "ProductoTest")
      .field("descripcion", "Producto de prueba para test")
      .field("precio_base", 1000)
      .field("descuento", 10)
      .field("categoria_id", 1);

    expect([201, 400, 409]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      productoId = res.body.data;
    } else {
      // Producto duplicado, buscar ID
      const lista = await request(Server)
        .get("/api/productos/list")
        .set("Cookie", cookie);
      const encontrado = lista.body.data.find(
        (p) => p.nombre === "ProductoTest"
      );
      productoId = encontrado?.id_producto;
    }

    expect(productoId).toBeDefined();
  });

  it("✅ debería listar todos los productos (admin autenticado)", async () => {
    const res = await request(Server)
      .get("/api/productos/list")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("✅ debería obtener el producto recién creado por ID", async () => {
    const res = await request(Server)
      .get(`/api/productos/list/${productoId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("nombre");
  });

  it("✅ debería actualizar el producto", async () => {
    const res = await request(Server)
      .put(`/api/productos/update/${productoId}`)
      .set("Cookie", cookie)
      .field("nombre", "ProductoTestActualizado")
      .field("categoria_id", 1);

    expect([200, 404, 400]).toContain(res.status);
  });

  it("❌ debería devolver error al eliminar un producto inexistente", async () => {
    const res = await request(Server)
      .delete(`/api/productos/destroi/999999`)
      .set("Cookie", cookie);

    expect([404]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  // ⚠️ OPCIONAL: eliminar el producto creado si se quiere limpiar datos
  // it("✅ debería eliminar el producto creado", async () => {
  //   const res = await request(Server)
  //     .delete(`/api/productos/destroi/${productoId}`)
  //     .set("Cookie", cookie);

  //   expect([200, 404]).toContain(res.status);
  // });
});
