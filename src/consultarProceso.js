import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

// ✅ Leer variables desde .env directamente
const {
  AUTH_URL: authUrl,
  AUDIENCE: audience,
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  SIGNING_URL: signingUrl
} = process.env;

// ✅ Obtener token de autenticación
async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

// ✅ Consultar estado del proceso
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

// ✅ Ejecutar consulta
(async () => {
  try {
    const token = await obtenerToken();
    await consultarEstado('30250e92-e4e8-4dd9-82b2-49350f0aaeca-20250711161159', token);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
})();
