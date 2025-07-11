// routes/firma.routes.js
import { Router } from "express";
import { ejecutarProcesoFirma } from "../controllers/firmaController.js";

const router = Router();

// Ruta para iniciar el proceso de firma
router.post("/firmar", ejecutarProcesoFirma);

export default router;