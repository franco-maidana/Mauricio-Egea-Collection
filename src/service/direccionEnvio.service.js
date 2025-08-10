import * as DireccionModel from "../models/direccionEnvio.model.js";

// Crear dirección de envío
export const crearDireccionEnvio = async (userId, datos) => {
  // Validaciones
  if (!datos.direccion || !datos.ciudad || !datos.provincia_id) {
    throw new Error("Faltan datos obligatorios");
  }
  if (datos.direccion.length > 255) throw new Error("La dirección es demasiado larga");
  if (datos.ciudad.length > 100) throw new Error("La ciudad es demasiado larga");
  if (datos.cp && datos.cp.length > 10) throw new Error("El código postal es demasiado largo");
  if (datos.telefono && datos.telefono.length > 30) throw new Error("El teléfono es demasiado largo");
  if (datos.referencia && datos.referencia.length > 255) throw new Error("La referencia es demasiado larga");
  if (isNaN(datos.provincia_id) || Number(datos.provincia_id) <= 0) {
    throw new Error("Provincia inválida");
  }

  // Verificar si ya tiene dirección registrada
  const direcciones = await DireccionModel.obtenerDireccionesPorUsuario(userId);
  if (direcciones.length > 0) {
    throw new Error("Este usuario ya tiene una dirección registrada");
  }

  return await DireccionModel.crearDireccionEnvio(userId, datos);
};

// Listar direcciones de un usuario
export const obtenerDireccionesPorUsuario = async (userId) => {
  return await DireccionModel.obtenerDireccionesPorUsuario(userId);
};

// Listar TODAS las direcciones (admin)
export const listarDireccionesEnvio = async (page = 1, limit = 5) => {
  return await DireccionModel.obtenerTodasLasDirecciones(page, limit);
};

// Obtener una dirección por ID
export const obtenerDireccionPorId = async (id) => {
  const direccion = await DireccionModel.obtenerDireccionPorId(id);
  if (!direccion) throw new Error("Dirección no encontrada");
  return direccion;
};

// Actualizar una dirección
export const actualizarDireccionEnvio = async (id, userId, datos) => {
  const direccion = await DireccionModel.obtenerDireccionPorId(id, userId);
  if (!direccion) throw new Error("Dirección no encontrada");

  if (datos.direccion && datos.direccion.length > 255) throw new Error("La dirección es demasiado larga");
  if (datos.ciudad && datos.ciudad.length > 100) throw new Error("La ciudad es demasiado larga");
  if (datos.cp && datos.cp.length > 10) throw new Error("El código postal es demasiado largo");
  if (datos.telefono && datos.telefono.length > 30) throw new Error("El teléfono es demasiado largo");
  if (datos.referencia && datos.referencia.length > 255) throw new Error("La referencia es demasiado larga");

  if (
    datos.provincia_id !== undefined &&
    datos.provincia_id !== "" &&
    (isNaN(datos.provincia_id) || Number(datos.provincia_id) <= 0)
  ) {
    throw new Error("Provincia inválida");
  }

  return await DireccionModel.actualizarDireccionEnvio(id, userId, datos);
};

// Eliminar una dirección
export const eliminarDireccionEnvio = async (id, userId) => {
  const direccion = await DireccionModel.obtenerDireccionPorId(id, userId);
  if (!direccion) throw new Error("Dirección no encontrada");

  return await DireccionModel.eliminarDireccionEnvio(id, userId);
};
