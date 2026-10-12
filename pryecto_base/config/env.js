import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: `${projectRoot}.env`, quiet: true });
const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) throw new Error('Configura SESSION_SECRET con al menos 32 caracteres en .env. Consulta .env.example.');
export const config = {
  production: process.env.NODE_ENV === 'production', secret,
  port: Number(process.env.PORT || 2800), host: process.env.HOST || '127.0.0.1',
  trustProxy: process.env.TRUST_PROXY === '1' ? 1 : false,
  database: {
    name: process.env.BD_NOMBRE || 'semana_ingenieria', user: process.env.BD_USUARIO || 'semana',
    password: process.env.BD_CLAVE || '', host: process.env.BD_HOST || '127.0.0.1', port: Number(process.env.BD_PORT || 3306),
  },
};
