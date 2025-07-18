import axios from "axios";
import emailRemember from "../templates/templateEmailGerentes.js";
import { Gerente } from "../models/gerente.js"; // asegúrate que tu modelo esté correctamente exportado
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de entorno desde .env

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
async function enviarCorreo(destinatarioEmail, htmlContent) {
  const token = await getToken();
  const sender = "comercial@affi.net";

  console.log("Sender:", sender);

  const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;
  console.log("📬 URL generada:", JSON.stringify(urlMailSend));

  const jsonBody = {
    message: {
      subject: "Recordatorio de Firma",
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
export default async function enviarCorreoRecordatorio(destinatario, processId, numContrato, nombreCliente, asunto) {
  // 🔍 Buscar gerente por nombre completo (name + " " + last_name)
  console.log("🔍 Buscando gerente con nombre exacto:", destinatario);
  const gerente = await Gerente.findOne({
    $expr: {
      $eq: [
        { $concat: ["$name", " ", "$last_name"] },
        destinatario
      ]
    }
  });
  console.log("📨 Correo encontrado:", gerente?.email);

  if (!gerente || !gerente.email) {
    throw new Error(`❌ No se encontró correo para ${destinatario}`);
  }

  const fechaEnvio = new Date().toLocaleDateString("es-CO");

  // 🔎 LOG para verificar los valores
  console.log("📦 Datos enviados a la plantilla:");
  console.log({
    destinatario,
    numContrato,
    nombreCliente,
    fechaEnvio,
    processId,
    asunto
  });

  // 📨 Generar HTML con plantilla
  const htmlBody = emailRemember(
    destinatario,
    numContrato,
    nombreCliente,
    fechaEnvio,
    processId,
    asunto
  );

  // 🚀 Enviar
  await enviarCorreo(gerente.email, htmlBody);
  console.log(`📧 Recordatorio enviado a ${destinatario} (${gerente.email})`);
}
