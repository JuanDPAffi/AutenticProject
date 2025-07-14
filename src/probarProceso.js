// probarProceso.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const {
  AUTH_URL,
  AUDIENCE,
  CLIENT_ID,
  CLIENT_SECRET,
  SIGNING_URL
} = process.env;

const massiveProcessingId = "caf06326-c30e-4db9-a6b4-4390454127fb-20250714084159"; // Cambia por el que quieras probar

// Obtener token
async function obtenerToken() {
  const res = await axios.post(AUTH_URL, {
    audience: AUDIENCE,
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });
  return res.data.access_token;
}

// Consultar proceso por massiveProcessingId
async function consultarProcesoPorMassiveId(massiveId, token) {
  try {
    const res = await axios.get(`${SIGNING_URL}${massiveId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.body?.processes?.[0] || null;
  } catch (err) {
    console.error("❌ Error al consultar el massiveProcessingId:", err.response?.data || err.message);
    return null;
  }
}

// Main
(async () => {
  try {
    const token = await obtenerToken();
    console.log("🔑 Token obtenido");

    const proceso = await consultarProcesoPorMassiveId(massiveProcessingId, token);

    if (!proceso) {
      console.log("❌ No se encontró ningún proceso con ese massiveProcessingId");
    } else {
      console.log("✅ Proceso encontrado:");
      console.log(JSON.stringify(proceso, null, 2));
    }
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }
})();
