// Crea la conexión compartida de Sequelize con MariaDB. Sequelize permite trabajar con
// modelos JavaScript en lugar de escribir cada consulta SQL a mano.
import { Sequelize } from "sequelize";
import { config } from "./env.js";
// Recibe el nombre de la base, el usuario, la contraseña y la dirección definidos en .env.
export const db = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    dialect: "mariadb",
    host: config.database.host,
    port: config.database.port,
    logging: false,
    timezone: "+00:00",
// El pool reutiliza hasta cinco conexiones para no abrir una nueva en cada consulta.
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
// utf8mb4 permite guardar acentos, símbolos y emojis en el texto de los visitantes.
    define: { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" },
  },
);
