import fetch from "node-fetch";

export async function getPromociones(bin = "450995", amount = 1000) {
  const url = `https://api.mercadopago.com/v1/payment_methods/installments?bin=${bin}&amount=${amount}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error al consultar MP: ${response.status} ${response.statusText}`);
  }

  // 🔑 Formateamos la data para frontend
  return data.map(item => ({
    tarjeta: item.payment_method_id,
    banco: item.issuer?.name || "Desconocido",
    logo: item.issuer?.secure_thumbnail || "",
    cuotas: item.payer_costs.map(pc => ({
      cantidad: pc.installments,
      mensaje: pc.recommended_message,
      monto_cuota: pc.installment_amount,
      monto_total: pc.total_amount,
      interes: pc.installment_rate === 0 ? "sin interés" : `${pc.installment_rate}%`,
    })),
  }));
}
