import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import fs from "fs";

// ✅ Leer variables desde el .env
const {
  AUTH_URL: authUrl,
  AUDIENCE: audience,
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  SIGNING_URL: signingUrl
} = process.env;

// ✅ Obtener token
async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

// ✅ Descargar archivos del proceso
async function descargarArchivos(processId, token) {
  const { data } = await axios.get(
    `${signingUrl}get-files/${processId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const archivos = data.body.files;
  for (const archivo of archivos) {
    const response = await axios.get(archivo.url, { responseType: 'arraybuffer' });
    fs.writeFileSync(`./${archivo.name}`, response.data);
    console.log(`✅ Archivo descargado: ${archivo.name} (estado: ${archivo.status})`);
  }
}

// ✅ Ejecutar
(async () => {
  try {
    const token = await obtenerToken();
    await descargarArchivos("65c91354", token); // Reemplaza con el ID real del proceso
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
})();
