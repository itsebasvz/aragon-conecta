import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { Conferencia, Administrador } from '../models/index.js';
import { conferencias } from '../data/conferencias.js';
try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres y máximo 72 bytes) en .env.');
  await db.authenticate();
  await db.transaction(async transaction => {
    for (const conferencia of conferencias) await Conferencia.findOrCreate({ where: { slug: conferencia.slug }, defaults: conferencia, transaction });
    if (!await Administrador.findOne({ where: { email }, transaction })) await Administrador.create({ email, passwordHash: await bcrypt.hash(password, 12) }, { transaction });
  });
  console.log('Contenido inicial listo. Los registros existentes se conservaron.');
} catch (error) {
  console.error('No se pudo cargar el contenido:', error.message);
  process.exitCode = 1;
} finally { await db.close(); }
