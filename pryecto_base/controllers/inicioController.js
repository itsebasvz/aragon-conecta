import express from "express";
import bcrypt from "bcryptjs";
// "Base de datos" en memoria
const usuarios = [];
const inicio = (req, res) => {
  res.render("index.html");
};
const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    // 1. Validar campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje:
          "clearTodos los campos son obligatorios (nombre, email, password)",
      });
    }
    // 2. Validar formato de email (básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "Email inválido" });
    }
    // 3. Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }
    // 4. Verificar si el email ya está registrado
    const existe = usuarios.find((u) => u.email === email);
    if (existe) {
      return res.status(409).json({ mensaje: "El email ya está registrado" });
    }
    // 5. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // 6. Crear el usuario
    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre,
      email,

      password: passwordHash,
      fechaRegistro: new Date().toISOString(),
    };
    usuarios.push(nuevoUsuario);
    // 7. Responder (sin devolver la contraseña)
    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        fechaRegistro: nuevoUsuario.fechaRegistro,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
const usuarios_lista = async (req, res) => {
  const lista = usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    fechaRegistro: u.fechaRegistro,
  }));
  res.json(lista);
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
  res.json({
    mensaje: "Login exitoso",
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
  });
};
export { inicio, registro, usuarios_lista, login };
