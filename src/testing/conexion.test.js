import { describe, it, expect } from "vitest";
import Conexion from "../config/db.js";

describe("Conexión a la base de datos", () => {
  it("debería conectarse correctamente a la base de test", async () => {
    const [rows] = await Conexion.query("SELECT 1 + 1 AS result");
    expect(rows[0].result).toBe(2);
  });
});
