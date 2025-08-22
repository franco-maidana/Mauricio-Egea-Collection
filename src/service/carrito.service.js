import * as carritoModel from "../models/carrito.model.js";
import * as stockModel from "../models/stock.model.js";
import * as stockService from "../service/stock.service.js";

// agrega un producto del carrito
export async function agregarAlCarrito(
  user_id,
  producto_id,
  talle_id,
  cantidad,
  color_id
) {
  // 0) Normalizar cantidad
  const qty = Number(cantidad) || 1;

  // 1) Consultar si ya existe ese producto + talle + color en el carrito
  //    (luego ajustamos el model para que reciba color_id)
  const existente = await carritoModel.existeEnCarrito({
    user_id,
    producto_id,
    talle_id,
    color_id,
  });

  if (existente) {
    throw new Error(
      "Este producto ya está en tu carrito. Si querés agregar otro, modificá la cantidad dentro del carrito."
    );
  }

  // 2) Validar stock real ANTES de agregar (producto + talle + color)
  await assertStockDisponible(producto_id, talle_id, color_id, qty);

  // 3) Si hay stock, insertá normalmente (luego ajustamos el model para color_id)
  return await carritoModel.agregarAlCarrito({
    user_id,
    producto_id,
    talle_id,
    color_id,
    cantidad: qty,
  });
}

// Devuelve los productos del carrito de un usuario
export async function getCarritoByUserConTotal(user_id) {
  const productos = await carritoModel.getCarritoByUser(user_id);

  // Mapeo para asegurar valores numéricos y agregar color y talle al nombre
  const carritoConTotalPorItem = productos.map((prod) => {
    const precioNum =
      typeof prod.precio === "string" ? parseFloat(prod.precio) : prod.precio;
    const cantidadNum =
      typeof prod.cantidad === "string"
        ? parseInt(prod.cantidad)
        : prod.cantidad;

    return {
      id: prod.id, // 👈 este es el id de la fila en carrito
      producto_id: prod.producto_id,
      talle_id: prod.talle_id,
      color_id: prod.color_id,
      nombre: `${prod.producto} - Color: ${prod.color || "N/A"} - Talle: ${
        prod.talle || "N/A"
      }`,
      imagen: prod.imagen,
      cantidad: cantidadNum,
      precio_unitario: precioNum,
      subtotal: precioNum * cantidadNum,
    };
  });

  const subtotal = carritoConTotalPorItem.reduce(
    (acc, prod) => acc + prod.subtotal,
    0
  );

  // Sin costo de plataforma
  const total = subtotal;

  return {
    productos: carritoConTotalPorItem,
    subtotal,
    total,
  };
}

// modifica los producto del carrito
export async function modificarProductoEnCarrito(
  user_id,
  producto_id,
  talle_id,
  nuevosDatos,
  color_id
) {
  let actual;

  if (talle_id && color_id) {
    // Busco el registro exacto por producto+talle+color
    actual = await carritoModel.existeEnCarrito({
      user_id,
      producto_id,
      talle_id,
      color_id,
    });
  } else {
    // Si no llegan talle_id o color_id, busco la primera entrada de ese producto para el usuario
    actual = await carritoModel.getPrimeraEntradaProductoCarrito(
      user_id,
      producto_id
    );
  }

  if (!actual) throw new Error("No existe ese producto en tu carrito.");

  // Determinar la nueva cantidad
  let nuevaCantidad = nuevosDatos.cantidad;
  if (
    nuevaCantidad === undefined ||
    nuevaCantidad === null ||
    isNaN(Number(nuevaCantidad)) ||
    nuevaCantidad === ""
  ) {
    nuevaCantidad = actual.cantidad;
  }

  // Si no hay cambios, no hagas nada
  if (nuevaCantidad == actual.cantidad) {
    return 0;
  }

  // Validar stock para el nuevo valor (producto+talle+color)
  await assertStockDisponible(
    actual.producto_id,
    actual.talle_id,
    actual.color_id,
    nuevaCantidad
  );

  // Actualiza solo la cantidad
  return await carritoModel.updateCantidadCarrito({
    user_id,
    producto_id,
    talle_id: actual.talle_id,
    color_id: actual.color_id,
    cantidad: nuevaCantidad,
  });
}

// elimina un producto del carrito de compra
export async function eliminarProductoCarritoPorId(id, user_id) {
  // 1. Chequea que el item exista y le pertenezca al user
  const item = await carritoModel.getCarritoItemByIdAndUser(id, user_id);
  if (!item) throw new Error("No existe ese ítem en tu carrito.");

  // 2. Si existe y es del usuario, borrá
  const deleted = await carritoModel.deleteCarritoItemById(id);
  if (!deleted) throw new Error("Error al eliminar el producto del carrito.");
  return true;
}

// vacia el carrito de compras
export async function vaciarCarrito(user_id) {
  const eliminados = await carritoModel.vaciarCarritoUsuario(user_id);
  if (eliminados === 0) {
    throw new Error("El carrito ya estaba vacío o no existe.");
  }
  return eliminados;
}

export async function assertStockDisponible(
  id_producto,
  talle_id,
  color_id,
  cantidadSolicitada
) {
  const row = await stockService.getStockPorProductoYTalle(
    id_producto,
    talle_id,
    color_id
  );
  const disponible = row?.stock ?? 0;

  if (disponible <= 0) {
    const err = new Error("No hay stock disponible para ese color y talle.");
    err.code = "SIN_STOCK";
    throw err;
  }
  if (Number(cantidadSolicitada) > Number(disponible)) {
    const err = new Error(`Solo hay ${disponible} unidades disponibles.`);
    err.code = "STOCK_INSUFICIENTE";
    throw err;
  }
  return disponible;
}
