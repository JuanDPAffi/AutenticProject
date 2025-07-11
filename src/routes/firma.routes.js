// routes/firma.routes.js
import { Router } from "express";
import { ejecutarProcesoFirma } from "../controllers/firmaController.js";

const router = Router();

// Ruta para iniciar el proceso de firma
router.post("/firmar", ejecutarProcesoFirma);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API funcionando correctamente 🚀" });
});

export default router;