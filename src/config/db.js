// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// ✅ Cargar archivo .env correcto según entorno
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

// ✅ Crear el pool de conexión
const Conexion = mysql.createPool({
  host: process.env.SERVIDOR,
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.BASE_DE_DATOS,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Verificar la conexión al iniciar (opcional, pero recomendado)
(async () => {
  try {
    await Conexion.query('SELECT 1');
    console.log(`🟢 Conexión establecida con la base de datos [${process.env.BASE_DE_DATOS}]`);
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
})();

export default Conexion;
