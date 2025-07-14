// autenticService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config(); // ✅ Carga el archivo .env

// 🔐 Configuración desde .env
const audience = process.env.AUDIENCE;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const signingUrl = process.env.SIGNING_URL;
const enterpriseId = process.env.ENTERPRISE_ID;
const senderEmail = process.env.SENDER_EMAIL;
const senderIdentification = process.env.SENDER_IDENTIFICATION;

// 🔑 Obtener token de Autentic
async function obtenerToken() {
  try {
    const tokenUrl = "https://authorizer.autenticsign.com/v2/authorizer/getToken"; // ✅ URL fija oficial

    const payload = {
      audience,
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    };

    console.log("📤 Solicitando token con:", payload);

    const response = await axios.post(tokenUrl, payload);
    console.log("🔑 Token recibido correctamente");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error obteniendo token de Autentic:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de Autentic");
  }
}

// 📤 Enviar proceso de firma a Autentic
export async function enviarParaFirma(base64Reglamento, base64Contrato, firmantes) {
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
            {
              content: base64Reglamento,
              fileName: "REGLAMENTO_DE_FIANZA_AFFI.pdf"
            },
            {
              content: base64Contrato,
              fileName: "Contrato_Fianza.pdf"
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

    console.log("📦 Payload final:", JSON.stringify(payload, null, 2));

    const { data } = await axios.post(signingUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("📥 Respuesta de Autentic:", JSON.stringify(data, null, 2));

    console.log("✅ Proceso enviado a Autentic con éxito");

    const massiveProcessingId = data?.body?.massiveProcessingId;
    return {
      massiveProcessingId,
      raw: data
    };

  } catch (error) {
    console.error("❌ Error enviando a Autentic:", error.response?.data || error.message);
    throw new Error("No se pudo enviar el proceso de firma a Autentic");
  }
}

// 🕓 Calcular fecha de expiración en formato YYYY-MM-DD
function obtenerFechaExpiracion(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
}

// 🔍 Consultar estado del proceso en Autentic por massiveProcessingId
export async function consultarProcesoPorMassiveId(massiveProcessingId, token) {
  try {
    const url = `https://gateway.autenticsign.com/v2/processes/massive/${massiveProcessingId}`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("📥 Respuesta de estado de proceso:", JSON.stringify(data, null, 2));
    return data;

  } catch (error) {
    console.error("❌ Error al consultar proceso por massiveProcessingId:", error.response?.data || error.message);
    throw new Error("No se pudo consultar el estado del proceso en Autentic");
  }
}

export { obtenerToken };
