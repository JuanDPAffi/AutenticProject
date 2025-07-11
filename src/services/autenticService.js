import axios from "axios";

// 🔐 Configuración desde variables de entorno
const authUrl = process.env.AUTH_URL;
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
    const response = await axios.post(authUrl, {
      audience,
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    });
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
              fileName: "REGLAMENTO_DE_FIANZA_AFFI.pdf",
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
          expirationDate: obtenerFechaExpiracion(7),
          sendEmail: true
        }
      ]
    };

    const { data } = await axios.post(signingUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Proceso enviado a Autentic");
    return data;

  } catch (error) {
    console.error("❌ Error enviando a Autentic:", error.response?.data || error.message);
    throw new Error("No se pudo enviar el proceso de firma a Autentic");
  }
}

// 🕓 Calcular fecha de expiración
function obtenerFechaExpiracion(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}
