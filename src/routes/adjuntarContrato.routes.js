import express from "express";
import { adjuntarContrato } from "../controllers/adjuntarContratoController.js";

const router = express.Router();

router.post("/adjuntarcontrato", adjuntarContrato);

export default router;
