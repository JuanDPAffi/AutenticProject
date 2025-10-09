import express from "express";
import { registrarProcesoDesdeCorreo } from "../controllers/procesoController.js";
import { ejecutarSoloConvenio } from "../controllers/firmaController.js";

const router = express.Router();

router.post("/procesos/correo", registrarProcesoDesdeCorreo);

router.post("/firma/solo-convenio", ejecutarSoloConvenio);

export default router;
