import * as ProvinciaModel from "../models/provincia.model.js";

// Crear provincia con validaciones
export const crearProvincia = async (datos) => {
  // Validar campos obligatorios
  if (!datos.nombre || typeof datos.costo_envio === "undefined") {
    throw new Error("Faltan datos obligatorios");
  }

  // Validar tipo y valores
  const nombre = datos.nombre.trim();
  if (nombre.length === 0) {
    throw new Error("El nombre de la provincia no puede estar vacío");
  }
  if (nombre.length > 100) {
    throw new Error("El nombre es demasiado largo (máx. 100 caracteres)");
  }
  const costoEnvio = Number(datos.costo_envio);
  if (isNaN(costoEnvio)) {
    throw new Error("El costo de envío debe ser un número");
  }
  if (costoEnvio < 0) {
    throw new Error("El costo de envío no puede ser negativo");
  }

  // Validar que no exista la provincia (case-insensitive)
  const provincias = await ProvinciaModel.listarProvincias();
  const existe = provincias.some(
    (p) => p.nombre.trim().toLowerCase() === nombre.toLowerCase()
  );
  if (existe) {
    throw new Error("Ya existe una provincia con ese nombre");
  }

  // Crear la provincia (usando el nombre original recibido)
  return await ProvinciaModel.crearProvincia({
    nombre,
    costo_envio: costoEnvio,
  });
};

// Listar todas las provincias
export const listarProvincias = async () => {
  return await ProvinciaModel.listarProvincias();
};

// Obtener una provincia por ID
export const obtenerProvinciaPorId = async (id) => {
  const provincia = await ProvinciaModel.obtenerProvinciaPorId(id);
  if (!provincia) {
    throw new Error("Provincia no encontrada");
  }
  return provincia;
};

// Actualizar provincia con validaciones
export const actualizarProvincia = async (id, datos) => {
  const existe = await ProvinciaModel.obtenerProvinciaPorId(id);
  if (!existe) throw new Error("Provincia no encontrada");

  // Validar nombre y costo de envío si se mandan a actualizar
  if (datos.nombre) {
    const nombre = datos.nombre.trim();
    if (nombre.length === 0) {
      throw new Error("El nombre de la provincia no puede estar vacío");
    }
    if (nombre.length > 100) {
      throw new Error("El nombre es demasiado largo (máx. 100 caracteres)");
    }

    // Validar que no exista otra provincia con ese nombre
    const provincias = await ProvinciaModel.listarProvincias();
    const duplicada = provincias.some(
      (p) =>
        p.id !== Number(id) &&
        p.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (duplicada) {
      throw new Error("Ya existe otra provincia con ese nombre");
    }
  }

  if (typeof datos.costo_envio !== "undefined") {
    const costoEnvio = Number(datos.costo_envio);
    if (isNaN(costoEnvio)) {
      throw new Error("El costo de envío debe ser un número");
    }
    if (costoEnvio < 0) {
      throw new Error("El costo de envío no puede ser negativo");
    }
  }

  return await ProvinciaModel.actualizarProvincia(id, datos);
};

// Eliminar provincia
export const eliminarProvincia = async (id) => {
  const existe = await ProvinciaModel.obtenerProvinciaPorId(id);
  if (!existe) throw new Error("Provincia no encontrada");
  return await ProvinciaModel.eliminarProvincia(id);
};
