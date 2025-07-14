// generarTokenAutentic.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config(); // ✅ Carga las variables del .env

const {
  AUTH_URL,
  AUDIENCE,
  GRANT_TYPE,
  CLIENT_ID,
  CLIENT_SECRET
} = process.env;

async function obtenerToken() {
  try {
    const payload = {
      audience: AUDIENCE,
      grant_type: GRANT_TYPE,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    };

    console.log("📤 Enviando solicitud de token con:\n", payload);

    const { data } = await axios.post(AUTH_URL, payload);
    const token = data.access_token;

    console.log("\n✅ Token de Autentic generado:\n");
    console.log("Bearer " + token);
  } catch (error) {
    console.error("❌ Error generando token:", error.response?.data || error.message);
  }
}

obtenerToken();
