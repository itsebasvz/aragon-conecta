import { DataTypes } from 'sequelize';
import { db } from '../config/db.js';
export const Conferencia = db.define('Conferencia', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  categoria: { type: DataTypes.STRING(80), allowNull: false },
  resumen: { type: DataTypes.TEXT, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: true },
  horario: { type: DataTypes.STRING(80), allowNull: true },
  sede: { type: DataTypes.STRING(150), allowNull: true },
  orden: { type: DataTypes.INTEGER, allowNull: false },
  contenido: { type: DataTypes.JSON, allowNull: false },
}, { tableName: 'conferencias' });
export const Comentario = db.define('Comentario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conferenciaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Conferencia, key: 'id' } },
  nombre: { type: DataTypes.STRING(60), allowNull: false, validate: { len: [2, 60] } },
  mensaje: { type: DataTypes.TEXT, allowNull: false, validate: { len: [10, 1500] } },
  estado: { type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'), defaultValue: 'pendiente', allowNull: false },
}, { tableName: 'comentarios', indexes: [{ fields: ['conferenciaId', 'estado', 'createdAt'] }] });
Conferencia.hasMany(Comentario, { foreignKey: 'conferenciaId', as: 'comentarios', onDelete: 'RESTRICT' });
Comentario.belongsTo(Conferencia, { foreignKey: 'conferenciaId', as: 'conferencia' });
export const Administrador = db.define('Administrador', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'administradores' });
