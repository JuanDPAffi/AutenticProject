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

const rutaJSON = "/tmp/datosTemp.json";
const raw = readFileSync(rutaJSON, "utf-8");
const input = JSON.parse(raw);

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
          subject: `Firma contrato de fianza ${input.numero_de_contrato}`,
          message: `Ha sido asignado como firmante del contrato de fianza número ${input.numero_de_contrato}, correspondiente a una solicitud generada por ${input.nombre_inmobiliaria || input.nombre_establecimiento_comercio}. Por favor revise los documentos adjuntos y proceda con la firma digital para continuar con el proceso de vinculación.`,
          order: true,
          // expirationDate: obtenerFechaExpiracion(7),
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
// function obtenerFechaExpiracion(dias) {
//   const fecha = new Date();
//   fecha.setDate(fecha.getDate() + dias);
//   return fecha.toISOString().split("T")[0];
// }

const BASE_URL = process.env.AUTENTIC_API_BASE

export async function consultarProcesoPorMassiveId(massiveProcessingId, token) {
  try {
    const url = `${BASE_URL}/v3/signing-process/${massiveProcessingId}`;
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

// 📥 Descargar archivos firmados usando el processId
export async function descargarArchivosFirmados(processId, token) {
  try {
    const url = `${process.env.END_POINT_API_GET_FILE}/${processId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const archivos = response.data?.body?.files || [];

    if (!archivos.length) {
      throw new Error("No se encontraron documentos firmados para este proceso.");
    }

    console.log(`📄 ${archivos.length} documentos firmados encontrados.`);

    // Descargar cada archivo y convertirlo en Buffer
    const archivosDescargados = await Promise.all(archivos.map(async (doc) => {
      const binario = await axios.get(doc.url, {
        responseType: "arraybuffer"
      });

      return {
        name: doc.name, // 👈 CAMBIO: usar 'name' en lugar de 'nombre'
        buffer: Buffer.from(binario.data)
      };
    }));

    return archivosDescargados;

  } catch (error) {
    console.error("❌ Error al descargar archivos firmados:", error.response?.data || error.message);
    throw new Error("Fallo al obtener archivos desde Autentic");
  }
}