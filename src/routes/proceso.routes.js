import express from "express";
import { registrarProcesoDesdeCorreo } from "../controllers/procesoController.js";
import { ejecutarSoloConvenio } from "../controllers/firmaController.js";
import { adjuntarConvenio } from "../controllers/adjuntarConvenioController.js";

const router = express.Router();

router.post("/procesos/correo", registrarProcesoDesdeCorreo);

router.post("/firma/solo-convenio", ejecutarSoloConvenio);

router.post("/adjuntarconvenio", adjuntarConvenio);

export default router;
