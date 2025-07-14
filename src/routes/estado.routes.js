// routes/estado.routes.js
import express from "express";
import { consultarYActualizarEstadoProceso } from "../controllers/estadoController.js";

const router = express.Router();

router.post("/consultarEstadoProceso", consultarYActualizarEstadoProceso);

export default router;
