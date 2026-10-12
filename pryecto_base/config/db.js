import { Sequelize } from 'sequelize';
import { config } from './env.js';
export const db = new Sequelize(config.database.name, config.database.user, config.database.password, {
  dialect: 'mariadb', host: config.database.host, port: config.database.port, logging: false, timezone: '+00:00',
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
});
