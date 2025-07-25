// src/server.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Rutas
import firmaRoutes from "./routes/firma.routes.js";
import estadoRoutes from "./routes/estado.routes.js";
import adjuntarContratoRouter from "./routes/adjuntarContrato.routes.js";
import procesoRoutes from "./routes/proceso.routes.js";
import emailReminderRoutes from "./routes/emailReminder.routes.js";

// ✅ Cargar variables de entorno
dotenv.config();

// ✅ Captura de errores críticos
process.on("uncaughtException", (err) => {
  console.error("💥 uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
});

const PORT = process.env.PORT || process.env.WEBSITES_PORT || 3000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Heartbeat de prueba (puedes quitarlo luego)
  setInterval(() => {
    console.log(`⏳ Heartbeat: ${new Date().toISOString()}`);
  }, 60000);

  // Ruta de prueba
  app.get("/api/test", (req, res) => {
    console.log("📍 /api/test fue consultada");
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Cargar rutas
  console.log("📦 Cargando rutas...");
  app.use("/api", firmaRoutes);
  app.use("/api/procesos", estadoRoutes);
  app.use("/api", adjuntarContratoRouter);
  app.use("/api", emailReminderRoutes);
  app.use("/api", procesoRoutes);
  console.log("✅ Rutas cargadas");

  // Intentar conectar a MongoDB
  try {
    if (!process.env.MONGO_URI || !process.env.MONGO_DB) {
      throw new Error("❌ MONGO_URI o MONGO_DB no están definidos");
    }

    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("⚠️ No se pudo conectar a MongoDB:", err.message);
  }

  // Lanzar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
}

startServer();
