import session from 'express-session';
import connectSessionSequelize from 'connect-session-sequelize';
import { db } from './db.js';
const SequelizeStore = connectSessionSequelize(session.Store);
export const sessionStore = new SequelizeStore({ db, tableName: 'sesiones', expiration: 1000 * 60 * 60 * 8, checkExpirationInterval: 1000 * 60 * 15 });
