// services/autenticService.js
import axios from "axios";
import { autenticConfig } from "../autentic.config.js";

const { authUrl, audience, clientId, clientSecret, signingUrl, enterpriseId, senderEmail, senderIdentification } = autenticConfig;

async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

function obtenerFechaExpiracion(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}

export async function enviarParaFirma(base64Reglamento, base64PDF, firmantes) {
  try {
    const token = await obtenerToken();

    const payload = {
      sendCompletionNotification: true,
      emailForNotification: senderEmail,
      processes: [
        {
          enterpriseId,
          senderEmail,
          senderIdentification,
          signers: firmantes,
          documents: [
            { content: base64Reglamento, fileName: "REGLAMENTO DE FIANZA AFFI.pdf", requireSignature: false },
            { content: base64PDF, fileName: "Contrato_Fianza.pdf", requireSignature: true }
          ],
          subject: "Firma del Contrato de Fianza",
          message: "Por favor firme el contrato digitalmente.",
          order: true,
          expirationDate: obtenerFechaExpiracion(7),
          sendEmail: true
        }
      ]
    };

    const { data } = await axios.post(`${signingUrl}start-process`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return data;
  } catch (error) {
    console.error("❌ Error enviando a Autentic:", error.response?.data || error);
    throw error;
  }
}