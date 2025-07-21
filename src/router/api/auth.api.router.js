import { Router } from "express";
import passport from "../../config/passport.js";
import {
  loginPassport,
  logoutPassport,
  mePassport,
} from "../../controller/auth.controller.js";
import { requireAuthPassport } from "../../middlewares/auth.middleware.js";
import {unlinkGoogle} from '../../controller/user.controller.js'

const authRouter = Router();

// -------------------------------
// Login, logout y usuario actual
// -------------------------------

// POST /api/auth/login
authRouter.post("/login", loginPassport);

// POST /api/auth/logout
authRouter.post("/logout", logoutPassport);

// GET /api/auth/me (protegido)
authRouter.get("/me", requireAuthPassport, mePassport);

authRouter.post("/google/unlink", requireAuthPassport, unlinkGoogle);


// -------------------------------
// Google OAuth2
// -------------------------------

// GET /api/auth/google - Inicia login con Google
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /api/auth/google/callback - Callback de Google
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/error", // Redirige a esta ruta si falla
    session: true,
  }),
  (req, res) => {
    // Si el login fue exitoso, devuelve JSON con los datos del usuario
    res.json({
      ok: true,
      user: req.user,
      message: "Inicio de sesión con Google exitoso"
    });
  }
);

// Ruta para mostrar error de login con Google
authRouter.get("/google/error", (req, res) => {
  res.status(401).json({ ok: false, error: "Error de login con Google" });
});

export default authRouter;
