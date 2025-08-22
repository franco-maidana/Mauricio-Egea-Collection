import * as carritoService from '../service/carrito.service.js';

// agrega un producto al carrito
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

// ver los productos del carrito
export async function getCarritoByUser(req, res, next) {
  try {
    const user_id = req.user?.id;

    const resumen = await carritoService.getCarritoByUserConTotal(user_id);

    res.status(200).json({
      ok: true,
      carrito: resumen.productos,   // ahora cada producto trae "id"
      subtotal: resumen.subtotal,
      total: resumen.total
    });
  } catch (err) {
    next(err);
  }
}

// modificar cantidad
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

// eliminar producto por id
export async function deleteCarritoItemById(req, res, next) {
  try {
    const id = parseInt(req.params.id); // id de la fila en carrito
    const user_id = req.user?.id;

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

// vaciar carrito completo
export async function clearCarrito(req, res, next) {
  try {
    const user_id = req.user?.id;
    const eliminados = await carritoService.vaciarCarrito(user_id);

    res.status(200).json({
      ok: true,
      message: "Carrito vaciado correctamente",
      eliminados
    });
  } catch (err) {
    res.status(404).json({
      ok: false,
      message: err.message
    });
  }
}
