// src/models/directorModel.js
import mongoose from "mongoose";

const directorSchema = new mongoose.Schema({
  name: String,
  last_name: String,
  email: String,
  zona: String
});

export default mongoose.model("Director", directorSchema, "directores_comerciales");
