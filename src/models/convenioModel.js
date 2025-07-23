// src/models/convenioModel.js

import mongoose from "mongoose";

const convenioSchema = new mongoose.Schema({
  numero_contrato: { type: String, required: true },
  numero_convenio: { type: String, required: true },
  fecha_generacion: { type: Date, default: Date.now }
});

export default mongoose.model("Convenio", convenioSchema);
