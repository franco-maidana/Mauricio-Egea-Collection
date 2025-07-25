import { Router } from "express";
import { preference } from "../../config/mercadopago.js";
import { resumenFinalPorUsuario } from "../../service/checkout.service.js"; // <--- IMPORTÁ EL SERVICIO
import Conexion from "../../config/db.js";

const mercadoPago = Router();

mercadoPago.post("/crear-preferencia", async (req, res) => {
  try {
    const userId = req.user?.id;

    // Traé el resumen
    const { productos, subtotal, costoPlataforma, costoEnvio } = await resumenFinalPorUsuario(userId);

    // Traé la última dirección del usuario
    const [dirs] = await Conexion.execute(
      "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    if (!dirs.length) {
      return res.status(404).json({ ok: false, message: "No tiene direcciones cargadas" });
    }
    const direccion = dirs[0];

    // Armá payer e items como te pasé arriba
    const payer = {
      name: req.user?.name,
      surname: req.user?.last_name,
      email: req.user?.email,
      phone: {
        area_code: "11",
        number: req.user?.telefono || ""
      },
      address: {
        street_name: direccion.direccion,
        street_number: direccion.numero || "",
        zip_code: direccion.cp || ""
      }
    };

    const items = productos.map(p => ({
      id: p.id?.toString(),
      title: `${p.producto} - Talle: ${p.talle}${p.color ? ` - Color: ${p.color}` : ''}`,
      category_id: p.categoria || "fashion",
      description: p.descripcion
        ? p.descripcion
        : `Producto: ${p.producto}, Talle: ${p.talle}, ${p.color ? `Color: ${p.color}, ` : ""}Cantidad: ${p.cantidad}`,
      quantity: p.cantidad,
      currency_id: "ARS",
      unit_price: Number(p.precio),
      picture_url: p.imagen
    }));

    if (costoPlataforma > 0) {
      items.push({
        id: "COSTO_PLATAFORMA",
        title: "Costo de plataforma",
        category_id: "others",
        description: "Cargo por uso de la plataforma",
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(costoPlataforma)
      });
    }
    if (costoEnvio > 0) {
      items.push({
        id: "COSTO_ENVIO",
        title: "Costo de envío",
        category_id: "others",
        description: "Envío a domicilio",
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(costoEnvio)
      });
    }

    const external_reference = `orden-${userId}-${Date.now()}`;

    const preferenceData = {
      items,
      payer,
      external_reference,
      notification_url: "https://tutienda.com/api/mercadopago/webhook", // Cambiá por la tuya
      back_urls: {
        success: "https://tutienda.com/success",
        failure: "https://tutienda.com/failure",
        pending: "https://tutienda.com/pending"
      },
      auto_return: "approved"
    };

    const response = await preference.create({ body: preferenceData });

    res.status(200).json({
      id: response.id,
      init_point: response.init_point
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mercadoPago.post('/webhook', (req, res) => {
  console.log("WEBHOOK Mercado Pago:", req.body);
  res.status(200).send("OK");
});


export default mercadoPago;
