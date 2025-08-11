// src/controller/auth.controller.js
import bcrypt from "bcrypt";
import * as userService from "../service/user.service.js";
import passport from "../config/passport.js";

// Helper para devolver solo datos públicos
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  last_name: u.last_name,
  role: u.role,
  avatar_url: u.avatar_url,
});

// ==============================
// LOGIN manual (sin Passport)
// ==============================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await userService.findUserByEmailWithHash(email);
    if (!user) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

    // Anti–session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      return res.json({
        ok: true,
        message: "Inicio de sesión exitoso",
        user: publicUser(user),
      });
    });
  } catch (err) {
    next(err);
  }
};

// ==============================
// LOGIN con Passport (estrategia local)
// ==============================
export const loginPassport = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: info?.message || "Credenciales inválidas" });
    }

    // Anti–session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
          ok: true,
          message: "Inicio de sesión exitoso",
          user: publicUser(user),
        });
      });
    });
  })(req, res, next);
};

// ==============================
// LOGOUT (común para ambas variantes)
// ==============================
const clearSidCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("sid", {
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
};

export const logout = (req, res) => {
  // Manual (sin passport)
  req.session.destroy(() => {
    clearSidCookie(res);
    return res.json({ ok: true, message: "Sesión cerrada correctamente" });
  });
};

export const logoutPassport = (req, res) => {
  // Con passport
  req.logout(() => {
    req.session.destroy(() => {
      clearSidCookie(res);
      return res.json({ ok: true, message: "Sesión cerrada correctamente" });
    });
  });
};

// ==============================
// /me (manual y passport)
// ==============================
export const me = async (req, res) => {
  // Variante manual: usa req.session.userId
  if (!req.session?.userId) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }
  const user = await userService.findUserById(req.session.userId);
  if (!user) return res.status(401).json({ ok: false, message: "No autenticado" });
  return res.json({ ok: true, user: publicUser(user) });
};

export const mePassport = (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ ok: false, message: "No autenticado" });
  }
  return res.json({ ok: true, user: publicUser(req.user) });
};
