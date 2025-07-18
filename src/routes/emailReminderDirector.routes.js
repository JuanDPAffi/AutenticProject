import express from "express";
import { enviarRecordatorioADirector } from "../controllers/emailReminderDirectorController.js";

const router = express.Router();

router.post("/hubspot/emailReminderDirector", enviarRecordatorioADirector);

export default router;
