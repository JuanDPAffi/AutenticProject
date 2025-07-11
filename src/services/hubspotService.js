// services/hubspotService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function obtenerDatosPorNumeroContrato(numeroContrato, token) {
  try {
    const response = await axios.get(`https://api.hubapi.com/crm/v3/objects/2-27967747/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      data: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "numero_de_contrato",
                operator: "EQ",
                value: numeroContrato
              }
            ]
          }
        ],
        properties: [
          "tipo_persona",
          "nombre_persona_natur",
          "nombre_inmobiliaria",
          "nombre_representante_legal",
          "ciudad_inmobiliaria",
          "cedula",
          "cedula_representante_legal",
          "correo",
          "numero_celular"
        ],
        limit: 1
      },
      method: "POST"
    });

    const resultados = response.data.results;
    if (resultados.length === 0) {
      throw new Error(`No se encontró vinculación con número de contrato: ${numeroContrato}`);
    }

    return resultados[0].properties;
  } catch (error) {
    console.error("❌ Error consultando por número de contrato en HubSpot:", error.response?.data || error.message);
    throw error;
  }
}

