import mongoose from "mongoose";

const gerenteSchema = new mongoose.Schema({
  cc: Number,
  name: String,
  last_name: String,
  email: String,
  type: String
}, { collection: 'gerencias' });

export const Gerente = mongoose.model('Gerente', gerenteSchema);
