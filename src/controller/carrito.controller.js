import * as carritoService from '../service/carrito.service.js';

// agrega un producto del carrito de compra 
export async function addToCart(req, res, next) {
  try {
    const user_id = req.user?.id;
    const { producto_id, talle_id, cantidad, color_id } = req.body;

    // Validación básica
    if (!producto_id || !talle_id || !cantidad || !color_id) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos obligatorios: producto_id, talle_id, color_id o cantidad"
      });
    }

    await carritoService.agregarAlCarrito(user_id, producto_id, talle_id, cantidad, color_id);

    return res.status(201).json({
      ok: true,
      message: "Producto agregado al carrito"
    });
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
}

// se ve los productos dentro del carrito de compra
export async function getCarritoByUser(req, res, next) {
  try {
    const user_id = req.user?.id

    // Usamos la función correcta del service:
    const resumen = await carritoService.getCarritoByUserConTotal(user_id);

    res.status(200).json({
      ok: true,
      carrito: resumen.productos,
      subtotal: resumen.subtotal,
      costoPlataforma: resumen.costoPlataforma,
      total: resumen.total
    });
  } catch (err) {
    next(err);
  }
}

// se modifica un producto dentro de un carrito de compras 
export async function updateCantidadEnCarrito(req, res, next) {
  try {
    const user_id = req.user?.id;
    const { producto_id, talle_id, cantidad, color_id } = req.body;

    const resultado = await carritoService.modificarProductoEnCarrito(
      user_id,
      producto_id,
      talle_id,
      { cantidad },
      color_id
    );

    if (resultado) {
      res.status(200).json({ ok: true, message: 'Cantidad actualizada en el carrito' });
    } else {
      res.status(200).json({ ok: true, message: 'No se realizaron cambios' });
    }
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
}

// se elimina un producto dentro del carrito de compras
export async function deleteCarritoItemById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    // El user_id puede venir del token/sesión o, si no tenés auth, de req.params.user_id
    const user_id = req.user?.id // O de req.user.id si usás JWT/session

    await carritoService.eliminarProductoCarritoPorId(id, user_id);

    res.status(200).json({
      ok: true,
      message: "Producto eliminado del carrito"
    });
  } catch (err) {
    res.status(404).json({
      ok: false,
      message: err.message
    });
  }
}

// se vacia por completo el carrito de compras
export async function clearCarrito(req, res, next) {
  try {
    // Si usás JWT/session: const user_id = req.user.id;
    // Si no, lo tomás del params:
    const user_id = req.user?.id

    const eliminados = await carritoService.vaciarCarrito(user_id);

    res.status(200).json({
      ok: true,
      message: "Carrito vaciado correctamente",
      eliminados // cantidad de ítems borrados
    });
  } catch (err) {
    res.status(404).json({
      ok: false,
      message: err.message
    });
  }
}