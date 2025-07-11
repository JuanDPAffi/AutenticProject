// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import firmaRoutes from "./src/routes/firma.routes.js";

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use("/api", firmaRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB,
}).then(() => {
  console.log("✅ Conectado a MongoDB");
  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Error conectando a MongoDB:", err);
});