import "dotenv/config";
import axios from "axios";

const {
  CLIENT_ID_HUBSPOT,
  CLIENT_SECRET_HUBSPOT,
  REFRESH_TOKEN_HUBSPOT,
  END_POINT_GET_TOKEN_API_HUBSPOT
} = process.env;

export default async function getHubspotToken() {
  try {
    console.log("🔄 Solicitando token a HubSpot...");

    const response = await axios.post(END_POINT_GET_TOKEN_API_HUBSPOT, null, {
      params: {
        grant_type: "refresh_token",
        client_id: CLIENT_ID_HUBSPOT,
        client_secret: CLIENT_SECRET_HUBSPOT,
        refresh_token: REFRESH_TOKEN_HUBSPOT
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const { access_token, expires_in } = response.data;

    console.log("✅ Token recibido:", { access_token, expires_in });
    return access_token;
  } catch (error) {
    console.error("❌ Error obteniendo token de HubSpot:", error.response?.data || error.message);
    throw error;
  }
}
