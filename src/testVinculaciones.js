import getHubspotToken from "./utils/getTokenHubspot.js";
import axios from "axios";

try {
  const token = await getHubspotToken();

  const response = await axios.get("https://api.hubapi.com/crm/v3/objects/2-27967747", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      limit: 10 // puedes subir este número si quieres más resultados
    }
  });

  console.log("📦 Vinculaciones encontradas:");
  console.dir(response.data.results, { depth: null });
} catch (error) {
  console.error("❌ Error al consultar vinculaciones:", error.response?.data || error.message);
}
