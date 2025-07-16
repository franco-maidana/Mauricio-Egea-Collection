function errorHandler(err, req, res, next) {
  console.error(err);

  // Mostrar error detallado solo en desarrollo o test
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return res.status(500).json({
      ok: false,
      error: {
        name: err.name,
        message: err.message,
        code: err.code || null,
        stack: err.stack
      }
    });
  }

  // En producción: mensaje genérico
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
}

export default errorHandler;
