import getHubspotToken from "./utils/getTokenHubspot.js";
import axios from "axios";

try {
  const token = await getHubspotToken();

  const response = await axios.get("https://api.hubapi.com/crm/v3/objects/contacts", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("📦 Contactos desde HubSpot:");
  console.log(response.data.results);
} catch (error) {
  console.error("❌ Error al consultar contactos:", error.response?.data || error.message);
}
