import express from "express";
import { registrarProcesoDesdeCorreo } from "../controllers/procesoController.js";

const router = express.Router();

router.post("/procesos/correo", registrarProcesoDesdeCorreo);

export default router;
