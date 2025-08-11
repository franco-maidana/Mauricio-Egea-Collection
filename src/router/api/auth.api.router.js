import { Router } from "express";
import passport from "../../config/passport.js";
import {
  loginPassport,
  logoutPassport,
  mePassport,
} from "../../controller/auth.controller.js";
import { requireAuthPassport } from "../../middlewares/auth.middleware.js";
import { unlinkGoogle } from "../../controller/user.controller.js";

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

// GET /api/auth/google/callback - Callback de Google (con regenerate)
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) return next(err);
    if (!user) {
      // si falla, redirige a tu front (o a la ruta de error actual)
      return res.redirect(process.env.FRONTEND_FAILURE_URL || "/api/auth/google/error");
    }

    // 🔒 evitar session fixation
    req.session.regenerate((e) => {
      if (e) return next(e);
      req.logIn(user, (e2) => {
        if (e2) return next(e2);
        // mantenemos tu respuesta JSON actual
        return res.json({
          ok: true,
          user: req.user, // ya está poblado tras req.logIn
          message: "Inicio de sesión con Google exitoso",
        });
      });
    });
  })(req, res, next);
});

// Ruta para mostrar error de login con Google
authRouter.get("/google/error", (req, res) => {
  res.status(401).json({ ok: false, error: "Error de login con Google" });
});

export default authRouter;
