import * as ordenModel from '../models/orden.model.js';

// Trae las órdenes del usuario autenticado
export async function obtenerOrdenesPorUsuario(user_id) {
  return await ordenModel.getOrdenesPorUsuario(user_id);
}

// Trae todas las órdenes (solo para admin)
export async function obtenerTodasLasOrdenes() {
  return await ordenModel.getTodasLasOrdenes();
}

export async function buscarOrdenPorNumero(numero_orden) {
  return await ordenModel.getOrdenPorNumero(numero_orden);
}

export async function buscarOrdenPorPaymentId(payment_id_mp) {
  return await ordenModel.getOrdenPorPaymentId(payment_id_mp);
}