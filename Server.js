import "dotenv/config";
import express from "express";
import indexRouter from "./src/router/index.router.js";
import pathError from "./src/errors/PathError.js";
import errorHandler from "./src/errors/errorHandler.js";
import Conexion from "./src/config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";

const Server = express();

Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));
Server.use(cookieParser());
Server.use(session({
  secret: process.env.SESSION_SECRET || 'clave ultra secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}))

Server.use("/", indexRouter);

// Middleware para rutas no válidas (404)
Server.use(pathError);
Server.use(errorHandler);

// Middleware para errores generales
Server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

const PORT = process.env.PORT || 8081;

Server.listen(PORT, () => {
  console.log("servidor escuchando en el puerto: " + PORT);
  Conexion
});
