// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import firmaRoutes from "./routes/firma.routes.js";
import estadoRoutes from "./routes/estado.routes.js";
import adjuntarContratoRouter from "./routes/adjuntarContrato.routes.js";
import procesoRoutes from "./routes/proceso.routes.js";
import emailReminderRoutes from "./routes/emailReminder.routes.js";

// Cargar variables de entorno desde .env
dotenv.config();

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Ruta de prueba para saber si el servidor arranca
app.get("/api/test", (req, res) => {
  res.json({ message: "Ruta funcionando" });
});

// Cargar rutas
console.log("📦 Cargando rutas...");
app.use("/api", firmaRoutes);
app.use("/api/procesos", estadoRoutes);
app.use("/api", adjuntarContratoRouter);
app.use("/api", emailReminderRoutes);
app.use("/api", procesoRoutes);

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
  // Iniciar igual para poder testear el contenedor aunque falle Mongo
  app.listen(PORT, () => {
    console.log(`⚠️ Servidor iniciado sin conexión a MongoDB en http://localhost:${PORT}`);
  });
});

// Captura de errores no controlados
process.on("uncaughtException", (err) => {
  console.error("💥 uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
});
