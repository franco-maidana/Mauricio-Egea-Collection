import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar el archivo correcto según entorno
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

let Conexion;

try {
  Conexion = mysql.createPool({
    host: process.env.SERVIDOR,
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.BASE_DE_DATOS
  });

  console.log(`✅ Conectado a la base de datos: ${process.env.BASE_DE_DATOS}`);
} catch (error) {
  console.error('❌ Error en la conexión a la base de datos:', error.message);
}

export default Conexion;
