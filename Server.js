import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

import express from "express";
import indexRouter from "./src/router/index.router.js";
import pathError from "./src/errors/PathError.js";
import errorHandler from "./src/errors/errorHandler.js";
import Conexion from "./src/config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./src/config/passport.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import sanitize from "./src/middlewares/sanitize.middleware.js";
import MySQLStoreFactory from "express-mysql-session";

const Server = express();
const IS_PROD = process.env.NODE_ENV === "production";

/* 🛡️ Seguridad básica */
Server.disable("x-powered-by");
Server.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

/* 🌐 CORS con credenciales */
const allowedOrigins = [
  "https://mauricio-egea-collection-fe.vercel.app", // prod
  "http://localhost:5173",
  "http://localhost:5174",          // dev (Vite)
];
Server.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);             // Postman/CLI
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error("CORS bloqueado"));
  },
  credentials: true,
}));

/* 🚦 Rate limiting */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PROD ? 3 : 1000, // en dev no molesta
  message: { ok: false, message: "Demasiados intentos de login, espera 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json({ ok: false, message: "Demasiadas solicitudes" });
  },
});

/* Limiter específicos */
Server.use("/api/mercado-pago/webhook", webhookLimiter);
Server.use("/api", (req, res, next) => {
  if (req.path === "/mercado-pago/webhook") return next();
  return apiLimiter(req, res, next);
});
Server.use("/api/auth/login", loginLimiter);

/* Parsers + cookies + sanitizado */
Server.use(express.json({ limit: "100kb", strict: true }));
Server.use(express.urlencoded({ extended: true, limit: "100kb" }));
Server.use(cookieParser());
Server.use(sanitize);

/* Proxy (para cookies secure detrás de proxy) */
Server.set("trust proxy", 1);

/* 🧠 Sesión persistente en MySQL */
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.SERVIDOR,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.BASE_DE_DATOS,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 12 * 60 * 60 * 1000,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: { session_id: "sid", expires: "expires", data: "data" },
  },
});

Server.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "clave ultra secreta",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: IS_PROD,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,                                 // HTTPS en prod
    sameSite: IS_PROD ? "none" : "lax",              // compat dev
    maxAge: 1000 * 60 * 60 * 12,                     // 12h
  },
  unset: "destroy",
}));

/* Passport */
Server.use(passport.initialize());
Server.use(passport.session());

/* Rutas de la app */
Server.use("/", indexRouter);

/* Errores */
Server.use(pathError);
Server.use(errorHandler);

/* Puerto */
const PORT = process.env.PORT || 8081;

/* Arranque */
if (process.env.NODE_ENV !== "test") {
  const ready = async () => {
    try {
      await Conexion.query("SELECT 1");
      console.log("🟢 Conectado a la base de datos");
      console.log("🚀 Servidor corriendo en el puerto " + PORT);
    } catch (err) {
      console.error("❌ Error al conectar a la base de datos:", err.message);
      process.exit(1);
    }
  };
  Server.listen(PORT, ready);
}

export default Server;
