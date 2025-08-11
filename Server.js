import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

import express from "express";
import indexRouter from "./src/router/index.router.js";
import pathError from "./src/errors/PathError.js";
import errorHandler from "./src/errors/errorHandler.js";
import Conexion from "./src/config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from './src/config/passport.js';
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import sanitize from "./src/middlewares/sanitize.middleware.js";
import MySQLStoreFactory from "express-mysql-session";   // ⬅️ Store MySQL

const Server = express();

/* 
  🛡️ Seguridad básica:
  - Oculta la cabecera "X-Powered-By".
  - Cabeceras seguras con Helmet.
*/
Server.disable("x-powered-by");
Server.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/*
  🌐 CORS:
  - Solo permite solicitudes desde el frontend autorizado y localhost.
*/
const allowedOrigins = [
  "https://tu-frontend.vercel.app", // Producción
  "http://localhost:5173"           // Desarrollo local
];

Server.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Permite Postman o llamadas internas
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error("CORS bloqueado"));
  },
  credentials: true
}));

/*
  🚦 Rate limiting:
  - Limita el número de peticiones por IP.
*/
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3, // máx 3 intentos de login por IP
  message: { ok: false, message: "Demasiados intentos de login, espera 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false
});

Server.use("/api", apiLimiter);
Server.use("/api/auth/login", loginLimiter);

// Parsers
Server.use(express.json({ limit: "100kb", strict: true }));
Server.use(express.urlencoded({ extended: true, limit: "100kb" }));
Server.use(cookieParser());

// Sanitización global (para JSON/x-www-form-urlencoded)
Server.use(sanitize);

// ⛑️ Confía en el proxy (necesario para secure cookies detrás de Nginx/Render/etc.)
Server.set("trust proxy", 1);

// 🧠 Store de sesiones en MySQL (persistente)
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.SERVIDOR,               // 👈 tus variables
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.USUARIO,                // 👈
  password: process.env.PASSWORD,           // 👈
  database: process.env.BASE_DE_DATOS,      // 👈
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 12 * 60 * 60 * 1000,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: { session_id: "sid", expires: "expires", data: "data" }
  }
});

// Sesión (cookies endurecidas + store persistente)
Server.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET || 'clave ultra secreta',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // obliga HTTPS en prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ⬅️ CAMBIO CLAVE
    maxAge: 1000 * 60 * 60 * 12
  },
  unset: "destroy"
}));


// Passport
Server.use(passport.initialize());
Server.use(passport.session());

// Rutas
Server.use("/", indexRouter);

// Manejo de errores
Server.use(pathError);
Server.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 8081;

// ✅ Solo inicia el servidor si no está en modo test
if (process.env.NODE_ENV !== 'test') {
  const ready = async () => {
    try {
      await Conexion.query('SELECT 1'); // Verificar conexión
      console.log('🟢 Conectado a la base de datos');
      console.log('🚀 Servidor corriendo en el puerto ' + PORT);
    } catch (err) {
      console.error('❌ Error al conectar a la base de datos:', err.message);
      process.exit(1);
    }
  };

  Server.listen(PORT, ready);
}

export default Server;
