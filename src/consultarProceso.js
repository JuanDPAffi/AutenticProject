import axios from "axios";
import { autenticConfig } from "./config/autentic.config.js";

const { authUrl, audience, clientId, clientSecret, signingUrl } = autenticConfig;

// Obtener token de autenticación
async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

// Consultar estado del proceso
async function consultarEstado(massiveProcessingId, token) {
  const { data } = await axios.get(
    `${signingUrl}${massiveProcessingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  console.log("🔎 Estado del proceso:");
  console.log(JSON.stringify(data, null, 2));
}

// Ejecutar consulta
(async () => {
  try {
    const token = await obtenerToken();
    await consultarEstado('c19c63aa-c5ff-4741-93d3-c8a97537b146-20250710154959', token);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
})();
