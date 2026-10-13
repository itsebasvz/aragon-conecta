// Guarda las sesiones de Express en MariaDB. La cookie del navegador contiene un
// identificador; los datos de la sesión permanecen en el servidor.
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import { db } from "./db.js";
// Adapta Sequelize para que express-session pueda leer y escribir sus sesiones.
const SequelizeStore = connectSessionSequelize(session.Store);
export const sessionStore = new SequelizeStore({
  db,
  tableName: "sesiones",
// La sesión vence después de ocho horas. Cada quince minutos se revisan las sesiones
// vencidas.
  expiration: 1000 * 60 * 60 * 8,
  checkExpirationInterval: 1000 * 60 * 15,
});
