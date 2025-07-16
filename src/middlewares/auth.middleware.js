import * as userService from '../service/user.service.js';

// Middleware para proteger rutas (autenticación)
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    // Busca usuario real en la base de datos
    const user = await userService.findUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: 'No autenticado' });
    req.user = user; // el usuario ya viene "limpio" por tu service
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware para autorización por rol
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado - No tienes role suficiente para acceder a esta parte' });
  }
  next();
};
