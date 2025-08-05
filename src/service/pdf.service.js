import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generarRemitoPDF = async (orden) => {
  const doc = new PDFDocument({ margin: 40 });
  const folderPath = path.resolve("./remitos");

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
  const verticalAlignOffset = 4; // subir un poco el ícono para alinearlo con el texto

  doc.fontSize(12);

  if (fs.existsSync(iconTel)) doc.image(iconTel, posX, posY - verticalAlignOffset, { width: iconSize });
  doc.text("+54 9 221 455-3417", posX + 26, posY);
  posY += 28;

  if (fs.existsSync(iconEmail)) doc.image(iconEmail, posX, posY - verticalAlignOffset, { width: iconSize });
  doc.text("mauricioegeacollection@gmail.com", posX + 26, posY);
  posY += 28;

  if (fs.existsSync(iconIg)) doc.image(iconIg, posX, posY - verticalAlignOffset, { width: iconSize });
  doc.text("@mauricioegeacollection", posX + 26, posY);


  // === Ajuste de posición de la línea (subida un poco) ===
  // 🔼 Usamos una posición fija en lugar de moveDown
  const lineY = 135; // Ajustá este valor según el espacio exacto que querés

  doc.moveTo(40, lineY).lineTo(doc.page.width - 40, lineY).stroke();


  // === Título centrado ===
  doc.moveDown(1.5);
  doc.fontSize(18)
    .font("Helvetica-Bold")
    .text("¡Gracias por tu compra!", 40, doc.y, {
      align: "center",
      width: doc.page.width - 80
    });

  // === Espacio antes de datos ===
  doc.moveDown(1.5);

  // === Datos de la orden ===
  const numeroOrden = orden.numero_orden || `ORD-${Date.now()}`;
  doc.fontSize(12).font("Helvetica").text(`N° de Orden: ${numeroOrden}`, 40);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 40);
  doc.moveDown();

  const startY = doc.y;
  const colLeftX = 40;
  const colRightX = 300;

  doc.text(`Cliente: ${orden.usuario_nombre}`, colLeftX, startY);
  doc.text(`Email: ${orden.usuario_email}`, colLeftX, doc.y + 5);
  doc.text(`Teléfono: ${orden.telefono}`, colLeftX, doc.y + 5);

  doc.text(`Dirección de envío: ${orden.direccion_envio}`, colRightX, startY);
  doc.text(`Ciudad: ${orden.ciudad}`, colRightX, doc.y + 5);
  doc.text(`Código Postal: ${orden.cp}`, colRightX, doc.y + 5);

  // === Más espacio antes de la segunda línea ===
  doc.moveDown(2);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
  doc.moveDown(1);

  // === Detalle de la compra ===
  doc.font("Helvetica-Bold").fontSize(12).text("Detalle de la compra:", 40, doc.y);
  doc.moveDown(0.8);

  const colX = [50, 250, 320, 430];
  let yTabla = doc.y;

  doc.text("Producto", colX[0], yTabla);
  doc.text("Cant.", colX[1], yTabla);
  doc.text("Precio Unit.", colX[2], yTabla);
  doc.text("Subtotal", colX[3], yTabla);

  yTabla += 22;

  doc.font("Helvetica").fontSize(12);
  orden.productos.forEach((p) => {
    const subtotal = (p.precio_unitario ?? 0) * (p.cantidad ?? 0);
    doc.text(p.nombre, colX[0], yTabla);
    doc.text(p.cantidad.toString(), colX[1], yTabla);
    doc.text(`$${p.precio_unitario}`, colX[2], yTabla);
    doc.text(`$${subtotal}`, colX[3], yTabla);
    yTabla += 22;
  });

  // === Más espacio antes de línea final ===
  // yTabla += 6;
  // doc.moveTo(40, yTabla).lineTo(doc.page.width - 40, yTabla).stroke();

// === Totales alineados al final de la página ===
const xPosLabel = 50;
const xPosValue = 450;
const resumenY = doc.page.height - 120; // Ajusta la altura del bloque completo

// Línea separadora justo antes de los totales
doc.moveTo(40, resumenY - 20).lineTo(doc.page.width - 40, resumenY - 20).stroke();

// Forzar posición absoluta para evitar desalineaciones
doc.font("Helvetica").fontSize(11).text("Subtotal:", xPosLabel, resumenY, { continued: false });
doc.text(`$${(orden.subtotal ?? 0).toFixed(2)}`, xPosValue, resumenY, { align: "right" });

doc.text("Envío:", xPosLabel, resumenY + 20);
doc.text(`$${(orden.envio ?? 0).toFixed(2)}`, xPosValue, resumenY + 20, { align: "right" });

doc.font("Helvetica-Bold").text("TOTAL FACTURADO:", xPosLabel, resumenY + 50);
doc.text(`$${(orden.total ?? 0).toFixed(2)}`, xPosValue, resumenY + 50, { align: "right" });



doc.end();

  return filePath;
};
