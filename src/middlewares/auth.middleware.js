
// Middleware para proteger rutas (autenticación)
export const requireAuthPassport = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'No autenticado' });
};


// Middleware para autorización por rol
export const requireRolePassport = (...roles) => (req, res, next) => {
  // Asegurarse de que el usuario esté autenticado y tenga el rol requerido
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado - No tienes role suficiente para acceder a esta parte' });
  }
  next();
};
