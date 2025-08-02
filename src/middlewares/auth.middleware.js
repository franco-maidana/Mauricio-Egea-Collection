
// Middleware para proteger rutas (autenticación)
// Middleware para proteger rutas (autenticación)
export const requireAuthPassport = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    ok: false,
    message: 'No autorizado'
  });
};



// Middleware para autorización por rol
export const requireRolePassport = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      ok: false,
      message: 'Acceso denegado - No tienes el rol suficiente para acceder a esta parte'
    });
  }
  next();
};

