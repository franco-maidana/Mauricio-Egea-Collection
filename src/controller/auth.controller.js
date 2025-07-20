import bcrypt from 'bcrypt';
import * as userService from '../service/user.service.js';
import passport from '../config/passport.js'

// LOGIN: autentica y pone userId en la sesión
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmailWithHash(email);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  req.session.userId = user.id;
  // Respondemos solo datos públicos
  res.json({
    message: 'Inicio de sesión exitoso',
    name: user.name,
    last_name: user.last_name,
    role: user.role,
    avatar_url: user.avatar_url
  });
};

// Login passport 
export const loginPassport = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Credenciales inválidas' });
    }
    req.logIn(user, err => {
      if (err) return next(err);
      // Devolver solo datos públicos (adaptalo a tu modelo)
      return res.json({
        message: 'Inicio de sesión exitoso',
        name: user.name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url
      });
    });
  })(req, res, next);
};


// LOGOUT: destruye la sesión
export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error al cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada correctamente' });
  });
};

// Logout passport 
export const logoutPassport = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Error al cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada correctamente' });
  });
};

// /me: retorna usuario autenticado (solo datos públicos)
export const me = (req, res) => {
  // req.user ya fue seteado por requireAuth
  res.json({
    name: req.user.name,
    last_name: req.user.last_name,
    role: req.user.role,
    avatar_url: req.user.avatar_url
  });
};

// ME passport 
export const mePassport = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  res.json({
    name: req.user.name,
    last_name: req.user.last_name,
    role: req.user.role,
    avatar_url: req.user.avatar_url
  });
};
