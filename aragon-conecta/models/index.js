// Define las tablas de la aplicación: conferencias, comentarios y administradores. Cada
// propiedad indica qué dato guarda una columna y qué valores acepta.
import { DataTypes } from "sequelize";
import { db } from "../config/db.js";
// Una conferencia guarda sus datos generales. contenido reúne los textos, participantes y
// fotografías en JSON.
export const Conferencia = db.define(
  "Conferencia",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
// El slug es el nombre corto de la URL, como hello-world. No se puede repetir entre
// conferencias.
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    categoria: { type: DataTypes.STRING(80), allowNull: false },
    resumen: { type: DataTypes.TEXT, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: true },
    horario: { type: DataTypes.STRING(80), allowNull: true },
    sede: { type: DataTypes.STRING(150), allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false },
    contenido: { type: DataTypes.JSON, allowNull: false },
  },
  { tableName: "conferencias" },
);
// Cada reflexión pertenece a una conferencia. Los límites de texto también se comprueban
// en el modelo.
export const Comentario = db.define(
  "Comentario",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conferenciaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Conferencia, key: "id" },
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { len: [2, 60] },
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [10, 1500] },
    },
// Un comentario nuevo queda pendiente; sólo la administración puede aprobarlo o
// rechazarlo.
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
      defaultValue: "pendiente",
      allowNull: false,
    },
  },
  {
    tableName: "comentarios",
// Este índice ayuda a buscar los comentarios de una conferencia por estado y fecha.
    indexes: [{ fields: ["conferenciaId", "estado", "createdAt"] }],
  },
);
// Una conferencia tiene muchos comentarios; cada comentario pertenece a una conferencia.
// RESTRICT impide borrar una conferencia que aún tenga comentarios.
Conferencia.hasMany(Comentario, {
  foreignKey: "conferenciaId",
  as: "comentarios",
  onDelete: "RESTRICT",
});
Comentario.belongsTo(Conferencia, {
  foreignKey: "conferenciaId",
  as: "conferencia",
});
// La contraseña se guarda como hash, una representación protegida, en lugar de conservar
// su texto original.
export const Administrador = db.define(
  "Administrador",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false },
  },
  { tableName: "administradores" },
);
