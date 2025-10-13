import express from "express";
import { gestionarRecordatorioDesdeHubspot } from "../controllers/emailReminderController.js";

const router = express.Router();

// Gerencias
router.post("/emailReminder", gestionarRecordatorioDesdeHubspot);
router.post("/emailReminderDirector", gestionarRecordatorioDesdeHubspot); // ← AGREGAR ESTA

export default router;