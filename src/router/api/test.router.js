import { Router } from "express";
import {generarRemitoPDF} from '../../service/pdf.service.js'

const test = Router();

test.get("/test-pdf", async (req, res) => {
  // Simulación de orden con tus productos reales
  const orden = {
    id: 101,
    usuario_nombre: "Franco Maidana",
    usuario_email: "francomaidana094@gmail.com",
    telefono: '+542215220686',
    direccion_envio: '484 esquina 31 bis',
    ciudad: 'La Plata',
    cp: 1897,
    productos: [
      { nombre: "Conjunto Malibu Verde Militar", cantidad: 1, precio_unitario: 162000 },
      { nombre: "Remeron Curvo Deep Gray", cantidad: 2, precio_unitario: 45000 },
      { nombre: "Musculosa Oversize Camel", cantidad: 1, precio_unitario: 30000 },
    ],
    total: 162000 + (45000 * 2) + 30000,
  };

  try {
    const pdfPath = await generarRemitoPDF(orden);
    res.status(200).json({
      ok: true,
      message: "PDF generado correctamente con datos reales",
      file: pdfPath,
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ ok: false, message: "Error generando PDF" });
  }
});

export default test