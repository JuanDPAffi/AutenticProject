// services/hubspotService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const tokenEndpoint = process.env.END_POINT_GET_TOKEN_API_HUBSPOT;
const clientId = process.env.CLIENT_ID_HUBSPOT;
const clientSecret = process.env.CLIENT_SECRET_HUBSPOT;
const refreshToken = process.env.REFRESH_TOKEN_HUBSPOT;

export async function obtenerAccessTokenHubSpot() {
  try {
    const response = await axios.post(tokenEndpoint, null, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      params: {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error obteniendo access token de HubSpot:", error.response?.data || error);
    throw error;
  }
}

export async function obtenerDatosVinculacion(idVinculacion, token) {
  try {
    const response = await axios.get(`https://api.hubapi.com/crm/v3/objects/2-27967747/${idVinculacion}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.properties; // Aquí vienen tipo_persona, ciudad, etc.
  } catch (error) {
    console.error("❌ Error consultando datos en HubSpot:", error.response?.data || error);
    throw error;
  }
}
