// src/testing/setupTests.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { beforeAll } from "vitest";
import request from "supertest";
import Server from "../../Server.js";
import Conexion from "../../src/config/db.js";

export const adminEmail = "mauricioegea82@gmail.com";
export const adminPassword = "hola1234";

beforeAll(async () => {
  console.log("🧹 Limpiando usuarios de prueba dinámicos...");
  await Conexion.query("DELETE FROM users WHERE email LIKE 'usuariotest%@example.com'");

  console.log("👤 Verificando usuario admin de prueba...");
  const [rows] = await Conexion.query("SELECT id FROM users WHERE email = ?", [adminEmail]);

  if (rows.length === 0) {
    console.log("➡️ Usuario admin no existe, creándolo...");
    const res = await request(Server)
      .post("/api/users/create")
      .field("name", "Mauricio")
      .field("last_name", "Egea")
      .field("email", adminEmail)
      .field("password", adminPassword);

    if (res.status !== 201) {
      console.error("⚠️ Error al crear el usuario admin:", res.body);
    }
  } else {
    console.log("✅ Usuario admin ya existe, no se crea de nuevo.");
  }
});
