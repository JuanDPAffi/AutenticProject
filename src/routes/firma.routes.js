// routes/firma.routes.js
import express from "express";
import { ejecutarProcesoFirma } from "../controllers/firmaController.js";

const router = express.Router();

// Ruta para iniciar el proceso de firma
router.post("/firmar", ejecutarProcesoFirma);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API funcionando correctamente 🚀" });
});

export default router;