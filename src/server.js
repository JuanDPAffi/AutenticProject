import express from "express";
import dotenv from "dotenv";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();

const app = express();
app.use(express.json());

// Rutas
app.use("/api", webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
