import { Router } from "express";
import { preference } from "../../config/mercadopago.js";
import { resumenFinalPorUsuario } from "../../service/checkout.service.js"; // <--- IMPORTÁ EL SERVICIO
import { MercadoPagoConfig, Payment } from "mercadopago";
import * as carritoModel from "../../models/carrito.model.js";
import * as carritoService from "../../service/carrito.service.js";
import * as ordenDetalleService from '../../service/ordenDetalle.service.js'
import Conexion from "../../config/db.js";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
const paymentApi = new Payment(mpClient);

const mercadoPago = Router();

mercadoPago.post("/crear-preferencia", async (req, res) => {
  try {
    const userId = req.user?.id;

    // Traé el resumen
    const { productos, subtotal, costoPlataforma, costoEnvio } =
      await resumenFinalPorUsuario(userId);

    // Traé la última dirección del usuario
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

    // Armá payer e items como te pasé arriba
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
      id: p.id?.toString(),
      title: `${p.producto} - Talle: ${p.talle}${
        p.color ? ` - Color: ${p.color}` : ""
      }`,
      category_id: p.categoria || "fashion",
      description: p.descripcion
        ? p.descripcion
        : `Producto: ${p.producto}, Talle: ${p.talle}, ${
            p.color ? `Color: ${p.color}, ` : ""
          }Cantidad: ${p.cantidad}`,
      quantity: p.cantidad,
      currency_id: "ARS",
      unit_price: Number(p.precio),
      picture_url: p.imagen,
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

    const external_reference = `orden-${userId}-${Date.now()}`;

    const preferenceData = {
      items,
      payer,
      external_reference,
      notification_url:
        "https://35d31fbff677.ngrok-free.app/api/mercado-pago/webhook",
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

mercadoPago.post("/webhook", async (req, res) => {
  try {
    // Log inicial de webhook recibido
    console.log("==== RECIBIENDO WEBHOOK DE MERCADO PAGO ====");
    console.log("BODY:", req.body);

    // Solo procesar si es un pago ("payment") y tiene ID
    if (req.body.type === "payment" && req.body.data && req.body.data.id) {
      const paymentId = req.body.data.id;

      // Obtener datos completos del pago desde la API de Mercado Pago
      const paymentData = await paymentApi.get({ id: paymentId });
      console.log("Datos completos del pago:", paymentData);

      // Solo continuar si el pago fue aprobado
      if (paymentData.status === "approved") {
        // Extraer el userId del campo external_reference ("orden-{userId}-{timestamp}")
        const external_reference = paymentData.external_reference;
        const total = paymentData.transaction_amount;
        const userId = Number(external_reference.split("-")[1]);

        // Buscar la última dirección de envío del usuario
        const [dirs] = await Conexion.execute(
          "SELECT id FROM direcciones_envio WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );
        if (!dirs.length) {
          console.log("No hay dirección de envío para el usuario:", userId);
          throw new Error("No hay dirección de envío");
        }
        const direccionEnvioId = dirs[0].id;

        // Insertar la orden en la base de datos con estado 'pagado'
        const [result] = await Conexion.execute(
          `INSERT INTO ordenes 
            (user_id, direccion_envio_id, total, estado, payment_id_mp, metodo_pago)
           VALUES (?, ?, ?, 'pagado', ?, 'mercado_pago')`,
          [userId, direccionEnvioId, total, paymentId]
        );

        // Generar un número de orden único (ejemplo: ORD-20250727-8)
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const numeroOrden = `ORD-${fecha}-${result.insertId}`;

        // Actualizar la orden con el número único
        await Conexion.execute(
          `UPDATE ordenes SET numero_orden = ? WHERE id = ?`,
          [numeroOrden, result.insertId]
        );
        console.log("Orden insertada en la base de datos. Número de orden:", numeroOrden);

        // Obtener productos del carrito del usuario antes de vaciarlo
        const { productos } = await carritoService.getCarritoByUserConTotal(userId);

        // === INSERTAR DETALLE DE ORDEN EN LA NUEVA TABLA ===
        for (const prod of productos) {
          const id_producto = prod.producto_id;
          const talle_id = prod.talle_id;
          const cantidad = prod.cantidad;
          const precio_unitario = prod.precio;
          const subtotal = prod.total_item;
          const nombre_producto = prod.producto;
          const imagen_url = prod.imagen;

          if (id_producto === undefined || talle_id === undefined) {
            console.log("Producto del carrito sin id_producto o talle_id:", prod);
            continue;
          }

          // Insertar cada producto como línea de detalle en la nueva tabla
          await ordenDetalleService.insertarDetalleEnOrden({
            orden_id: result.insertId,
            producto_id: id_producto,
            talle_id,
            cantidad,
            precio_unitario,
            subtotal,
            nombre_producto,
            imagen_url
          });
        }

        // Descontar stock de cada producto
        for (const prod of productos) {
          const id_producto = prod.producto_id;
          const talle_id = prod.talle_id;
          const cantidad = prod.cantidad;

          if (id_producto === undefined || talle_id === undefined) {
            console.log("Producto del carrito sin id_producto o talle_id:", prod);
            continue;
          }

          // Actualizar stock solo si hay suficiente (no permite negativo)
          const [result] = await Conexion.execute(
            `UPDATE stock_por_producto_talle
             SET stock = stock - ?
             WHERE id_producto = ? AND talle_id = ? AND stock >= ?`,
            [cantidad, id_producto, talle_id, cantidad]
          );

          if (result.affectedRows === 0) {
            console.log(`No se pudo descontar stock: producto ${id_producto}, talle ${talle_id}, cantidad ${cantidad}`);
          } else {
            console.log(`Stock actualizado: producto ${id_producto}, talle ${talle_id}, menos ${cantidad}`);
          }
        }

        // Vaciar el carrito del usuario después de la compra
        try {
          await carritoModel.vaciarCarritoUsuario(userId);
          console.log("Carrito vaciado correctamente para el usuario:", userId);
        } catch (e) {
          console.error("Error al vaciar carrito:", e.message);
        }
      } else {
        console.log("El pago no está aprobado. Estado:", paymentData.status);
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error en webhook Mercado Pago:", err);
    res.status(500).send("Error");
  }
});


export default mercadoPago;
