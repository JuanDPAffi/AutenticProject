// services/autenticService.js
import axios from "axios";

// Configuración desde variables de entorno
const authUrl = process.env.AUTH_URL;
const audience = process.env.AUDIENCE;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const signingUrl = process.env.SIGNING_URL;

const enterpriseId = process.env.ENTERPRISE_ID;
const senderEmail = process.env.SENDER_EMAIL;
const senderIdentification = process.env.SENDER_IDENTIFICATION;

// Obtener token de Autentic
async function obtenerToken() {
  const response = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  return response.data.access_token;
}

// Enviar proceso de firma
export async function enviarParaFirma(base64Reglamento, base64Contrato, firmantes) {
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
          {
            content: base64Reglamento,
            fileName: "REGLAMENTO DE FIANZA AFFI.pdf",
            requireSignature: false
          },
          {
            content: base64Contrato,
            fileName: "Contrato_Fianza.pdf",
            requireSignature: true
          }
        ],
        subject: "Firma del Contrato de Fianza",
        message: "Por favor firme el contrato digitalmente.",
        order: true,
        expirationDate: obtenerFechaExpiracion(7), // 7 días
        sendEmail: true
      }
    ]
  };

  const { data } = await axios.post(`${signingUrl}create`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return data;
}

// Utilidad para calcular fecha de expiración
function obtenerFechaExpiracion(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}
