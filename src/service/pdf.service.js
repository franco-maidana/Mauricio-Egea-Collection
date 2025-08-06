import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generarRemitoPDF = async (orden) => {
  try {
    const doc = new PDFDocument({ margin: 40 });
    const folderPath = path.resolve("./remitos");

    // Crear carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const filePath = path.resolve(folderPath, `remito_${orden.id}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // === Logo principal ===
    const logoPath = path.resolve("public/logoTienda/LogoTienda.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 110 });
    }

    // === Iconos de contacto ===
    const iconTel = path.resolve("public/logoTienda/brand-whatsapp.png");
    const iconEmail = path.resolve("public/logoTienda/mail.png");
    const iconIg = path.resolve("public/logoTienda/brand-instagram.png");

    let posX = doc.page.width - 260;
    let posY = 50;

    const iconSize = 18;
    const verticalAlignOffset = 4;

    doc.fontSize(12);

    if (fs.existsSync(iconTel)) doc.image(iconTel, posX, posY - verticalAlignOffset, { width: iconSize });
    doc.text("+54 9 221 455-3417", posX + 26, posY);
    posY += 28;

    if (fs.existsSync(iconEmail)) doc.image(iconEmail, posX, posY - verticalAlignOffset, { width: iconSize });
    doc.text("mauricioegeacollection@gmail.com", posX + 26, posY);
    posY += 28;

    if (fs.existsSync(iconIg)) doc.image(iconIg, posX, posY - verticalAlignOffset, { width: iconSize });
    doc.text("@mauricioegeacollection", posX + 26, posY);

    // === Línea separadora ===
    const lineY = 135;
    doc.moveTo(40, lineY).lineTo(doc.page.width - 40, lineY).stroke();

    // === Título ===
    doc.moveDown(1.5);
    doc.fontSize(18)
      .font("Helvetica-Bold")
      .text("¡Gracias por tu compra!", 40, doc.y, {
        align: "center",
        width: doc.page.width - 80
      });

    doc.moveDown(1.5);

    // === Datos de la orden ===
    const numeroOrden = orden.numero_orden || `ORD-${Date.now()}`;
    doc.fontSize(12).font("Helvetica").text(`N° de Orden: ${numeroOrden}`, 40);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 40);
    doc.moveDown();

    const startY = doc.y;
    const colLeftX = 40;
    const colRightX = 300;

    doc.text(`Cliente: ${orden.usuario_nombre || "N/A"}`, colLeftX, startY);
    doc.text(`Email: ${orden.usuario_email || "N/A"}`, colLeftX, doc.y + 5);
    doc.text(`Teléfono: ${orden.telefono || "N/A"}`, colLeftX, doc.y + 5);

    doc.text(`Dirección de envío: ${orden.direccion_envio || "N/A"}`, colRightX, startY);
    doc.text(`Ciudad: ${orden.ciudad || "N/A"}`, colRightX, doc.y + 5);
    doc.text(`Código Postal: ${orden.cp || "N/A"}`, colRightX, doc.y + 5);

    doc.moveDown(2);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(1);

    // === Detalle de la compra ===
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle de la compra:", 40, doc.y);
    doc.moveDown(0.8);

    const colX = [50, 280, 370, 470];
    let yTabla = doc.y;

    doc.text("Producto", colX[0], yTabla);
    doc.text("Cant.", colX[1], yTabla);
    doc.text("Precio Unit.", colX[2], yTabla);
    doc.text("Subtotal", colX[3], yTabla);

    yTabla += 20;

    doc.font("Helvetica").fontSize(12);

    if (orden.productos && orden.productos.length > 0) {
      orden.productos.forEach((p) => {
        const nombreProducto = p.nombre || `${p.producto || "Producto"} - Talle: ${p.talle || ""}`;
        const precio = parseFloat(p.precio_unitario ?? p.precio) || 0;
        const cantidad = parseInt(p.cantidad ?? 0);
        const subtotal = parseFloat(p.subtotal) || (precio * cantidad);

        doc.text(nombreProducto, colX[0], yTabla, { width: 220 });
        doc.text(cantidad.toString(), colX[1], yTabla);
        doc.text(`$${precio.toFixed(2)}`, colX[2], yTabla);
        doc.text(`$${subtotal.toFixed(2)}`, colX[3], yTabla);
        yTabla += 20;
      });
    } else {
      doc.text("No hay productos cargados", colX[0], yTabla);
      yTabla += 20;
    }

        // =======================
    // BLOQUE DE TOTALES AL PIE (AJUSTADO)
    // =======================
    const pageHeight = doc.page.height;
    const marginBottom = 60;
    const yLinea = pageHeight - marginBottom - 45;
    const yTotales = yLinea + 10;

    // Línea separadora
    doc.moveTo(40, yLinea)
       .lineTo(doc.page.width - 40, yLinea)
       .stroke();

    const xPosLabel = 350;
    const xPosValue = 470;

    doc.font("Helvetica").fontSize(12);
    doc.text("Subtotal:", xPosLabel, yTotales);
    doc.text(`$${(orden.subtotal ?? 0).toFixed(2)}`, xPosValue, yTotales, { align: "right" });

    doc.text("Envío:", xPosLabel, yTotales + 18);
    doc.text(`$${(orden.envio ?? 0).toFixed(2)}`, xPosValue, yTotales + 18, { align: "right" });

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("TOTAL FACTURADO:", xPosLabel, yTotales + 36);
    doc.text(`$${(orden.total ?? 0).toFixed(2)}`, xPosValue, yTotales + 36, { align: "right" });


    doc.end();

    return filePath;

  } catch (error) {
    console.error("❌ Error generando el PDF:", error);
    throw error;
  }
};
