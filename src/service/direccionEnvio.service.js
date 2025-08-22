import * as DireccionModel from "../models/direccionEnvio.model.js";

// Crear dirección de envío
export const crearDireccionEnvio = async (userId, datos) => {
  // Validaciones obligatorias
  if (!datos.calle || !datos.numero || !datos.ciudad || !datos.provincia_id) {
    throw new Error("Faltan datos obligatorios");
  }
  if (datos.calle.length > 100) throw new Error("La calle es demasiado larga");
  if (datos.numero.length > 10) throw new Error("El número es demasiado largo");
  if (datos.entre_calle_1 && datos.entre_calle_1.length > 100)
    throw new Error("Entre calle 1 es demasiado larga");
  if (datos.entre_calle_2 && datos.entre_calle_2.length > 100)
    throw new Error("Entre calle 2 es demasiado larga");
  if (datos.barrio && datos.barrio.length > 100) throw new Error("El barrio es demasiado largo");
  if (datos.ciudad.length > 100) throw new Error("La ciudad es demasiado larga");
  if (datos.cp && datos.cp.length > 10) throw new Error("El código postal es demasiado largo");
  if (datos.telefono && datos.telefono.length > 30) throw new Error("El teléfono es demasiado largo");
  if (datos.referencia && datos.referencia.length > 255)
    throw new Error("La referencia es demasiado larga");
  if (isNaN(datos.provincia_id) || Number(datos.provincia_id) <= 0) {
    throw new Error("Provincia inválida");
    
  }

  // Si la nueva dirección es predeterminada, desactivar las anteriores del usuario
  if (datos.es_predeterminada) {
    await DireccionModel.marcarTodasComoNoPredeterminadas(userId);
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

  // Validaciones
  if (datos.calle && datos.calle.length > 100) throw new Error("La calle es demasiado larga");
  if (datos.numero && datos.numero.length > 10) throw new Error("El número es demasiado largo");
  if (datos.entre_calle_1 && datos.entre_calle_1.length > 100)
    throw new Error("Entre calle 1 es demasiado larga");
  if (datos.entre_calle_2 && datos.entre_calle_2.length > 100)
    throw new Error("Entre calle 2 es demasiado larga");
  if (datos.barrio && datos.barrio.length > 100) throw new Error("El barrio es demasiado largo");
  if (datos.ciudad && datos.ciudad.length > 100) throw new Error("La ciudad es demasiado larga");
  if (datos.cp && datos.cp.length > 10) throw new Error("El código postal es demasiado largo");
  if (datos.telefono && datos.telefono.length > 30) throw new Error("El teléfono es demasiado largo");
  if (datos.referencia && datos.referencia.length > 255)
    throw new Error("La referencia es demasiado larga");

  if (
    datos.provincia_id !== undefined &&
    datos.provincia_id !== "" &&
    (isNaN(datos.provincia_id) || Number(datos.provincia_id) <= 0)
  ) {
    throw new Error("Provincia inválida");
  }

  // Si la actualizada es predeterminada, desactivar las demás
  if (datos.es_predeterminada) {
    await DireccionModel.marcarTodasComoNoPredeterminadas(userId);
  }

  return await DireccionModel.actualizarDireccionEnvio(id, userId, datos);
};

// Eliminar una dirección (soft delete sería más seguro)
export const eliminarDireccionEnvio = async (id, userId) => {
  const direccion = await DireccionModel.obtenerDireccionPorId(id, userId);
  if (!direccion) throw new Error("Dirección no encontrada");

  // Soft delete → desactiva en vez de borrar
  return await DireccionModel.actualizarDireccionEnvio(id, userId, { activo: 0 });
};

// if (datos.es_predeterminada) {
//   await DireccionModel.marcarTodasComoNoPredeterminadas(userId);
// }
