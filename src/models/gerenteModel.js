import mongoose from "mongoose";

const gerenteSchema = new mongoose.Schema({
  name: String,
  last_name: String,
  cc: Number,
  email: String,
  type: { type: String, enum: ["Comercial", "General"] }
}, {
  collection: "gerencias"  // <- 🔧 aquí le dices a Mongoose usar esa colección
});

export const Gerente = mongoose.model("Gerente", gerenteSchema);
