import mysql from 'mysql2/promise'

const Conexion = mysql.createPool({
  host: process.env.SERVIDOR,
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.BASE_DE_DATOS
})

if (Conexion) {
  console.log('te has conectado a la base de datos...')
}else(
  console.log('error en la conexion a la base de datos...')
)

export default Conexion