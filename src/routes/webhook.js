import express from "express";
import { ejecutarProcesoFirma } from "../controllers/firma.controller.js";

const router = express.Router();

router.post("/vinculacion", async (req, res) => {
  const { idVinculacion } = req.body;

  if (!idVinculacion) {
    return res.status(400).json({ error: "Falta el idVinculacion" });
  }

  try {
    await ejecutarProcesoFirma(idVinculacion);
    res.status(200).json({ message: "Contrato enviado correctamente" });
  } catch (error) {
    console.error("❌ Error en webhook:", error.message || error);
    res.status(500).json({ error: "Error al ejecutar proceso de firma" });
  }
});

export default router;
