// src/models/procesoModel.js

import mongoose from "mongoose";

const procesoSchema = new mongoose.Schema({
  processId: { type: String, required: true },
  asunto: { type: String, required: true },
  fecha: { type: String, required: true },
  firmante: { type: String, required: true },
  modificado: { type: String, required: true },
  zona: { type: String, default: "" },
  correoDirector: { type: Boolean, default: false },
  convenio: { type: Boolean, default: false }
});

export default mongoose.model("Proceso", procesoSchema, "procesos");