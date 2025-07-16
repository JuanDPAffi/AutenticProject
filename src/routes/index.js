import express from "express";

import adjuntarContratoRoutes from "./adjuntarContrato.routes.js";
import firmaRoutes from "./firma.routes.js";
import estadoRoutes from "./estado.routes.js";

const router = express.Router();

router.use("/firma", firmaRoutes);
router.use("/estado", estadoRoutes);
router.use("/adjuntarContrato", adjuntarContratoRoutes);

export default router;