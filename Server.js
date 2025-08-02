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

const Server = express();

// Middlewares
Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));
Server.use(cookieParser());

Server.use(session({
  secret: process.env.SESSION_SECRET || 'clave ultra secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
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
