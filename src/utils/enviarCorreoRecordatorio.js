// src/utils/enviarCorreoRecordatorio.js

import axios from "axios";
import emailRemember from "../templates/templateEmailGerentes.js";
import { Gerente } from "../models/gerenteModel.js";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Obtener token Microsoft Graph
async function getToken() {
  try {
    const url = `https://login.microsoftonline.com/${process.env.TENANT_ID_AD}/oauth2/v2.0/token`;
    console.log("🔐 URL para token:", url);

    const response = await axios.post(
      url,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID_AD,
        client_secret: process.env.CLIENT_SECRET_AD,
        scope: process.env.GRAPH_SCOPE
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error obteniendo token:");
    console.error("🧾 Status:", error.response?.status);
    console.error("🧾 Detalle:", error.response?.data || error.message);
    throw error;
  }
}

// 📧 Enviar correo con Graph API como comercial@affi.net
async function enviarCorreo(destinatarioEmail, htmlContent, esConvenio = false, numeroDocumento = "") {
  const token = await getToken();
  const sender = "comercial@affi.net";

  console.log("Sender:", sender);

  // 📧 Subject dinámico según el tipo de documento
  const tipoDocumento = esConvenio ? "convenio" : "contrato";
  const subject = `Recordatorio de firma de ${tipoDocumento}${numeroDocumento ? ` - ${numeroDocumento}` : ""}`;
  
  console.log(`📧 Subject generado: "${subject}"`);

  const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;
  console.log("📬 URL generada:", JSON.stringify(urlMailSend));

  const jsonBody = {
    message: {
      subject: subject,
      body: { contentType: "HTML", content: htmlContent },
      toRecipients: [{ emailAddress: { address: destinatarioEmail } }]
    },
    saveToSentItems: false
  };

  return axios.post(urlMailSend, jsonBody, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}

// 📩 Función principal exportada
export default async function enviarCorreoRecordatorio(
  tipoGerente, 
  processId, 
  numeroDocumento,  // ✅ Ya viene con el número correcto
  nombreCliente, 
  asunto,
  esConvenio = false
) {
  console.log("🔍 Buscando gerente por tipo:", tipoGerente);

  const gerente = await Gerente.findOne({ type: tipoGerente });
  if (!gerente || !gerente.email) {
    throw new Error(`❌ No se encontró gerente con tipo "${tipoGerente}"`);
  }

  const fechaEnvio = new Date().toLocaleDateString("es-CO");

  console.log("📦 Datos enviados a la plantilla:");
  console.log({
    destinatario: `${gerente.name} ${gerente.last_name}`,
    numeroDocumento,
    nombreCliente,
    fechaEnvio,
    processId,
    asunto,
    esConvenio
  });

  const htmlBody = emailRemember(
    `${gerente.name} ${gerente.last_name}`,
    numeroDocumento,
    nombreCliente,
    fechaEnvio,
    processId,
    asunto,
    esConvenio
  );

  await enviarCorreo(gerente.email, htmlBody, esConvenio, numeroDocumento);
  console.log(`📧 Recordatorio enviado a ${gerente.name} ${gerente.last_name} (${gerente.email})`);
}