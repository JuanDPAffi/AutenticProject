// services/autenticService.js
import axios from "axios";
import { autenticConfig } from "../autentic.config.js";

const {
  authUrl,
  audience,
  clientId,
  clientSecret,
  signingUrl,
  enterpriseId,
  senderEmail,
  senderIdentification
} = autenticConfig;

// 🔐 Obtener token desde Autentic
async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

// 📅 Fecha de expiración del proceso
function obtenerFechaExpiracion(dias = 7) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}

// 🚀 Enviar contrato para firma
export async function enviarParaFirma(base64Reglamento, base64PDF, firmantes) {
  try {
    if (!Array.isArray(firmantes) || firmantes.length === 0) {
      throw new Error("No se proporcionaron firmantes válidos.");
    }

    // Validación de campos mínimos por firmante
    for (const [i, f] of firmantes.entries()) {
      if (!f.name || !f.identification || !f.email) {
        throw new Error(`Firmante inválido en posición ${i + 1}: ${JSON.stringify(f)}`);
      }
    }

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
            },
            {
              content: base64PDF,
              fileName: "Contrato_Fianza.pdf",
            }
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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return data;
  } catch (error) {
    console.error("❌ Error enviando a Autentic:", error.response?.data || error.message || error);
    throw error;
  }
}
