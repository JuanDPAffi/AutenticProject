// server.js
import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./config/db.js"; 

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Ruta funcionando" });
});

// Cargar rutas de firma
console.log("📦 Cargando rutas..."); // <-- esto debería aparecer en docker logs
app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

connectDB();
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);

  // Mostrar las rutas cargadas
  console.log("API routes:");
  console.log(routes);
});
