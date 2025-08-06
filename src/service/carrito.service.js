import * as carritoModel from '../models/carrito.model.js';
import * as stockModel from '../models/stock.model.js'

// agrega un producto del carrito
export async function agregarAlCarrito(user_id, producto_id, talle_id, cantidad) {
  // 1. Consultar si ya existe ese producto+talle en el carrito
  const existente = await carritoModel.existeEnCarrito({ user_id, producto_id, talle_id });

  if (existente) {
    throw new Error('Este producto ya está en tu carrito. Si queres agregar otro, modifica la cantidad dentro del carrito');
  }

  // 2. Consultar stock real ANTES de agregar al carrito
  const stockRow = await stockModel.getStockPorProductoYTalle(producto_id, talle_id);
  const stockDisponible = stockRow?.stock ?? 0;

  if (stockDisponible < cantidad) {
    throw new Error('No hay stock suficiente para este producto y talle');
  }

  // 3. Si hay stock, insertá normalmente
  return await carritoModel.agregarAlCarrito({
    user_id,
    producto_id,
    talle_id,
    cantidad
  });
}

// Devuelve los productos del carrito de un usuario
export async function getCarritoByUserConTotal(user_id) {
  const productos = await carritoModel.getCarritoByUser(user_id);

  // Mapeo para asegurar valores numéricos y nombre completo
  const carritoConTotalPorItem = productos.map(prod => {
    const precioNum = typeof prod.precio === 'string' ? parseFloat(prod.precio) : prod.precio;
    const cantidadNum = typeof prod.cantidad === 'string' ? parseInt(prod.cantidad) : prod.cantidad;

    return {
      producto_id: prod.producto_id,
      talle_id: prod.talle_id, // ✅ Ahora enviamos el ID real del talle
      nombre: `${prod.producto} - Talle: ${prod.talle || 'N/A'}`,
      imagen: prod.imagen,
      cantidad: cantidadNum,
      precio_unitario: precioNum,
      subtotal: precioNum * cantidadNum
    };
  });

  const subtotal = carritoConTotalPorItem.reduce((acc, prod) => acc + prod.subtotal, 0);

  // Solo cobra costo de plataforma si hay productos
  const costoPlataforma = productos.length > 0 ? 100 : 0;
  const total = subtotal + costoPlataforma;

  return {
    productos: carritoConTotalPorItem,
    subtotal,
    costoPlataforma,
    total
  };
}




// modifica los producto del carrito
export async function modificarProductoEnCarrito(user_id, producto_id, talle_id, nuevosDatos) {
  let actual;
  if (talle_id) {
    // Busco el registro exacto
    actual = await carritoModel.existeEnCarrito({ user_id, producto_id, talle_id });
  } else {
    // Si no llega talle_id, busco el primer registro de ese producto para el usuario
    actual = await carritoModel.getPrimeraEntradaProductoCarrito(user_id, producto_id);
  }
  if (!actual) throw new Error('No existe ese producto en tu carrito.');

  // Determina la nueva cantidad
  let nuevaCantidad = nuevosDatos.cantidad;
  if (
    nuevaCantidad === undefined ||
    nuevaCantidad === null ||
    isNaN(Number(nuevaCantidad)) ||
    nuevaCantidad === ''
  ) {
    nuevaCantidad = actual.cantidad;
  }

  // Si no hay cambios, no hagas nada
  if (nuevaCantidad == actual.cantidad) {
    return 0;
  }

  // Actualiza solo la cantidad
  return await carritoModel.updateCantidadCarrito({
    user_id,
    producto_id,
    talle_id: actual.talle_id,
    cantidad: nuevaCantidad
  });
}

// elimina un producto del carrito de compra 
export async function eliminarProductoCarritoPorId(id, user_id) {
  // 1. Chequea que el item exista y le pertenezca al user
  const item = await carritoModel.getCarritoItemByIdAndUser(id, user_id);
  if (!item) throw new Error('No existe ese ítem en tu carrito.');

  // 2. Si existe y es del usuario, borrá
  const deleted = await carritoModel.deleteCarritoItemById(id);
  if (!deleted) throw new Error('Error al eliminar el producto del carrito.');
  return true;
}

// vacia el carrito de compras
export async function vaciarCarrito(user_id) {
  const eliminados = await carritoModel.vaciarCarritoUsuario(user_id);
  if (eliminados === 0) {
    throw new Error('El carrito ya estaba vacío o no existe.');
  }
  return eliminados;
}