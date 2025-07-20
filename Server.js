import "dotenv/config";
import express from "express";
import indexRouter from "./src/router/index.router.js";
import pathError from "./src/errors/PathError.js";
import errorHandler from "./src/errors/errorHandler.js";
import Conexion from "./src/config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from './src/config/passport.js'; // <-- Ajustá la ruta si está en otro lado

const Server = express();

Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));
Server.use(cookieParser());

Server.use(session({
  secret: process.env.SESSION_SECRET || 'clave ultra secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// Integración de Passport
Server.use(passport.initialize());
Server.use(passport.session());

// Tus rutas principales
Server.use("/", indexRouter);

// Middleware para rutas no válidas (404)
Server.use(pathError);
Server.use(errorHandler);

const PORT = process.env.PORT || 8081;

Server.listen(PORT, () => {
  console.log("servidor escuchando en el puerto: " + PORT);
  Conexion
});
