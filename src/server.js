// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import firmaRoutes from "./routes/firma.routes.js";
import estadoRoutes from "./routes/estado.routes.js";
import adjuntarContratoRouter from "./routes/adjuntarContrato.routes.js";

// Cargar variables de entorno desde .env
dotenv.config();

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Ruta funcionando" });
});

// Cargar rutas de firma
console.log("📦 Cargando rutas..."); // <-- esto debería aparecer en docker logs
app.use("/api", firmaRoutes);

app.use("/api/procesos", estadoRoutes);

app.use("/api", adjuntarContratoRouter);

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