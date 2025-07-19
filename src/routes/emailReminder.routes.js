import express from "express";
import { gestionarRecordatorioDesdeHubspot } from "../controllers/emailReminderController.js";

const router = express.Router();

// Gerencias
router.post("/emailReminder", gestionarRecordatorioDesdeHubspot);

export default router;
