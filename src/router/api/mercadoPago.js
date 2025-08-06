import { Router } from "express";
import { preference } from "../../config/mercadopago.js";
import { resumenFinalPorUsuario } from "../../service/checkout.service.js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import * as carritoModel from "../../models/carrito.model.js";
import * as carritoService from "../../service/carrito.service.js";
import * as ordenService from "../../service/orden.service.js";
import * as ordenDetalleService from "../../service/ordenDetalle.service.js";
import Conexion from "../../config/db.js";
import { generarRemitoPDF } from "../../service/pdf.service.js";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
const paymentApi = new Payment(mpClient);
const mercadoPago = Router();

const pagosProcesados = new Set();

// ==================== CREAR PREFERENCIA ====================
mercadoPago.post("/crear-preferencia", async (req, res) => {
  try {
    const userId = req.user?.id;

    const { productos, subtotal, costoPlataforma, costoEnvio } =
      await resumenFinalPorUsuario(userId);

    // Dirección
    const [dirs] = await Conexion.execute(
      "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    if (!dirs.length) {
      return res
        .status(404)
        .json({ ok: false, message: "No tiene direcciones cargadas" });
    }
    const direccion = dirs[0];

    const payer = {
      name: req.user?.name,
      surname: req.user?.last_name,
      email: req.user?.email,
      phone: {
        area_code: "11",
        number: req.user?.telefono || "",
      },
      address: {
        street_name: direccion.direccion,
        street_number: direccion.numero || "",
        zip_code: direccion.cp || "",
      },
    };

    const items = productos.map((p) => ({
      id: p.producto_id?.toString() ?? p.id?.toString(),
      title: `${p.nombre ?? p.producto} - Talle: ${p.talle || p.talle_id || "N/A"}`,
      category_id: p.categoria || "fashion",
      description: p.descripcion
        ? p.descripcion
        : `Producto: ${p.nombre ?? p.producto}, Talle: ${p.talle || p.talle_id}, Cantidad: ${p.cantidad}`,
      quantity: p.cantidad,
      currency_id: "ARS",
      unit_price: Number(p.precio_unitario ?? p.precio ?? 0),
      picture_url: p.imagen || "",
    }));

    if (costoPlataforma > 0) {
      items.push({
        id: "COSTO_PLATAFORMA",
        title: "Costo de plataforma",
        category_id: "others",
        description: "Cargo por uso de la plataforma",
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(costoPlataforma),
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
        unit_price: Number(costoEnvio),
      });
    }

    console.log("=== ITEMS ENVIADOS A MP ===");
    console.log(JSON.stringify(items, null, 2));

    const external_reference = `orden-${userId}-${Date.now()}`;

    const preferenceData = {
      items,
      payer,
      external_reference,
      notification_url:
        "https://fd6a31ad26da.ngrok-free.app/api/mercado-pago/webhook",
      back_urls: {
        success: "https://tutienda.com/success",
        failure: "https://tutienda.com/failure",
        pending: "https://tutienda.com/pending",
      },
      auto_return: "approved",
    };

    const response = await preference.create({ body: preferenceData });

    res.status(200).json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEBHOOK ====================
mercadoPago.post("/webhook", async (req, res) => {
  try {
    console.log("==== WEBHOOK DE MERCADO PAGO RECIBIDO ====");
    console.log("BODY COMPLETO:", req.body);

    // ✅ RESPUESTA INMEDIATA PARA QUE MERCADO PAGO NO REINTENTE
    if (!res.headersSent) res.sendStatus(200);

    if (req.body.type === "payment" && req.body.data && req.body.data.id) {
      const paymentId = req.body.data.id;

      if (pagosProcesados.has(paymentId)) {
        console.log(`⚠️ Pago ${paymentId} ya fue procesado (memoria), ignorando...`);
        return;
      }
      pagosProcesados.add(paymentId);
      setTimeout(() => pagosProcesados.delete(paymentId), 10 * 60 * 1000);

      console.log("📌 1) Obteniendo datos del pago para ID:", paymentId);
      const paymentData = await paymentApi.get({ id: paymentId });
      console.log("✅ Datos del pago:", paymentData);

      if (paymentData.status === "approved") {
        console.log("✅ 2) Pago aprobado, procesando orden...");

        const external_reference = paymentData.external_reference;
        const total = paymentData.transaction_amount;
        const userId = Number(external_reference.split("-")[1]);

        console.log("📌 3) UserId detectado:", userId);

        // ✅ Verificar si ya existe una orden para este paymentId
        const ordenExistente = await ordenService.buscarOrdenPorPaymentId(paymentId);
        if (ordenExistente) {
          console.log(`⚠️ Ya existe una orden para paymentId ${paymentId}, ignorando duplicado`);
          return;
        }

        // Buscar dirección
        const [dirs] = await Conexion.execute(
          "SELECT * FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );
        if (!dirs.length) {
          console.log("No hay dirección de envío para el usuario:", userId);
          throw new Error("No hay dirección de envío");
        }
        const direccionEnvioId = dirs[0].id;

        // Crear orden
        const [result] = await Conexion.execute(
          `INSERT INTO ordenes 
            (user_id, direccion_envio_id, total, estado, payment_id_mp, metodo_pago)
           VALUES (?, ?, ?, 'pagado', ?, 'mercado_pago')`,
          [userId, direccionEnvioId, total, paymentId]
        );

        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const numeroOrden = `ORD-${fecha}-${result.insertId}`;

        await Conexion.execute(
          `UPDATE ordenes SET numero_orden = ? WHERE id = ?`,
          [numeroOrden, result.insertId]
        );
        console.log("✅ 5) Orden creada ID:", result.insertId);

        // Productos del carrito
        const { productos } = await carritoService.getCarritoByUserConTotal(userId);
        console.log("📦 Productos en carrito:", productos);

        if (!productos || productos.length === 0) {
          console.log(`⚠️ No hay productos en el carrito para el pago ${paymentId}. No se genera PDF ni detalle.`);
          return;
        }

        for (const prod of productos) {
          console.log(`📌 Insertando detalle producto ID:${prod.producto_id}`);
          await ordenDetalleService.insertarDetalleEnOrden({
            orden_id: result.insertId,
            producto_id: prod.producto_id,
            talle_id: prod.talle_id ?? null,
            cantidad: prod.cantidad,
            precio_unitario: prod.precio_unitario ?? prod.precio ?? 0,
            subtotal: prod.subtotal ?? prod.total_item ?? 0,
            nombre_producto: prod.nombre ?? prod.producto ?? 'Producto',
            imagen_url: prod.imagen ?? ''
          });

          // Descontar stock
          console.log(`📌 Descontando stock producto:${prod.producto_id}, talle:${prod.talle_id}`);
          const [upd] = await Conexion.execute(
            `UPDATE stock_por_producto_talle
             SET stock = stock - ?
             WHERE id_producto = ? AND talle_id = ? AND stock >= ?`,
            [prod.cantidad, prod.producto_id, prod.talle_id ?? 0, prod.cantidad]
          );
          console.log("Resultado update stock:", upd);
        }

        // Buscar datos del usuario
        const [[usuario]] = await Conexion.execute(
          "SELECT name, last_name, email FROM users WHERE id = ?",
          [userId]
        );

        // Dirección completa
        const [[direccion]] = await Conexion.execute(
          "SELECT direccion, ciudad, cp, telefono FROM direcciones_envio WHERE id = ?",
          [direccionEnvioId]
        );

        if (productos.length > 0) {
          console.log("📌 7) Generando PDF...");
          await generarRemitoPDF({
            id: result.insertId,
            numero_orden: numeroOrden,
            usuario_nombre: `${usuario?.name ?? ''} ${usuario?.last_name ?? ''}`,
            usuario_email: usuario?.email ?? '',
            telefono: direccion?.telefono ?? 'N/A',
            direccion_envio: direccion?.direccion ?? 'N/A',
            ciudad: direccion?.ciudad ?? 'N/A',
            cp: direccion?.cp ?? 'N/A',
            productos,
            subtotal: productos.reduce((acc, p) => acc + Number(p.subtotal ?? p.total_item ?? 0), 0),
            envio: 0,
            total
          });
          console.log("✅ PDF generado en: remitos/remito_" + result.insertId + ".pdf");
        }

        // Vaciar carrito
        await carritoModel.vaciarCarritoUsuario(userId);
        console.log("✅ 8) Carrito vaciado correctamente");
      }
    }
  } catch (err) {
    console.error("❌ Error en webhook Mercado Pago:", err);
  }
});

export default mercadoPago;
