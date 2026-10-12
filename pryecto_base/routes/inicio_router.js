import express from "express";
import {
  inicio,
  registro,
  usuarios_lista,
  login,
} from "../controllers/inicioController.js";
const router = express.Router();
//Routing
router.get("/", inicio);
router.post("/registro", registro);
router.get("/lista", usuarios_lista);
router.post("/login", login);
export default router;
