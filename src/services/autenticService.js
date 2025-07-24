// autenticService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Configuración desde .env con validación
const CONFIG = {
  audience: process.env.AUDIENCE,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  signingUrl: process.env.SIGNING_URL,
  enterpriseId: process.env.ENTERPRISE_ID,
  senderEmail: process.env.SENDER_EMAIL,
  senderIdentification: process.env.SENDER_IDENTIFICATION,
  baseUrl: process.env.AUTENTIC_API_BASE,
  downloadEndpoint: process.env.END_POINT_API_GET_FILE
};

// ✅ Validar configuración al inicio
function validarConfiguracion() {
  const camposRequeridos = ['audience', 'clientId', 'clientSecret', 'signingUrl', 'enterpriseId', 'senderEmail', 'senderIdentification'];
  const camposFaltantes = camposRequeridos.filter(campo => !CONFIG[campo]);
  
  if (camposFaltantes.length > 0) {
    throw new Error(`Configuración incompleta en .env: ${camposFaltantes.join(', ')}`);
  }
}

// 🔑 Obtener token de Autentic
async function obtenerToken() {
  try {
    validarConfiguracion();
    
    const tokenUrl = "https://authorizer.autenticsign.com/v2/authorizer/getToken";
    const payload = {
      audience: CONFIG.audience,
      grant_type: "client_credentials",
      client_id: CONFIG.clientId,
      client_secret: CONFIG.clientSecret
    };

    console.log("📤 Solicitando token de Autentic...");
    
    const response = await axios.post(tokenUrl, payload, {
      timeout: 10000, // 10 segundos timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data?.access_token) {
      throw new Error("Token no recibido en la respuesta de Autentic");
    }

    console.log("🔑 Token obtenido exitosamente");
    return response.data.access_token;

  } catch (error) {
    console.error("❌ Error obteniendo token:", error.response?.data || error.message);
    throw new Error(`Fallo al obtener token de Autentic: ${error.message}`);
  }
}

// 📤 Enviar proceso de firma a Autentic (versión optimizada)
export async function enviarParaFirma({ documentos, firmantes, numeroContrato, nombreSolicitante }) {
  try {
    // ✅ Validaciones de entrada robustas
    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
      throw new Error("Se requiere al menos un documento válido");
    }
    
    if (!firmantes || !Array.isArray(firmantes) || firmantes.length === 0) {
      throw new Error("Se requiere al menos un firmante válido");
    }

    if (!numeroContrato) {
      throw new Error("Número de contrato es requerido");
    }

    // ✅ Validar que todos los documentos tengan content y fileName
    const documentosInvalidos = documentos.filter(doc => !doc.content || !doc.fileName);
    if (documentosInvalidos.length > 0) {
      throw new Error("Todos los documentos deben tener 'content' y 'fileName'");
    }

    console.log(`📋 Preparando envío: ${documentos.length} documentos, ${firmantes.length} firmantes`);

    const token = await obtenerToken();

    const payload = {
      sendCompletionNotification: true,
      emailForNotification: CONFIG.senderEmail,
      processes: [
        {
          enterpriseId: CONFIG.enterpriseId,
          senderEmail: CONFIG.senderEmail,
          senderIdentification: CONFIG.senderIdentification,
          signers: firmantes,
          documents: documentos,
          subject: `Firma contrato de fianza ${numeroContrato}`,
          message: `Ha sido asignado como firmante del contrato de fianza número ${numeroContrato}, correspondiente a una solicitud generada por ${nombreSolicitante}. Por favor revise los documentos adjuntos y proceda con la firma digital para continuar con el proceso de vinculación.`,
          order: true,
          sendEmail: true
        }
      ]
    };

    console.log("📦 Enviando proceso a Autentic...");
    
    const { data } = await axios.post(CONFIG.signingUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      timeout: 30000 // 30 segundos para el envío
    });

    const massiveProcessingId = data?.body?.massiveProcessingId;
    
    if (!massiveProcessingId) {
      console.error("❌ Respuesta de Autentic sin massiveProcessingId:", data);
      throw new Error("Autentic no retornó un massiveProcessingId válido");
    }

    console.log("✅ Proceso enviado exitosamente. ID:", massiveProcessingId);

    return {
      massiveProcessingId,
      raw: data
    };

  } catch (error) {
    console.error("❌ Error en enviarParaFirma:", error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error("Timeout al conectar con Autentic - intente nuevamente");
    }
    
    throw new Error(`Fallo al enviar proceso de firma: ${error.message}`);
  }
}

// 🕓 Calcular fecha de expiración en formato YYYY-MM-DD
// function obtenerFechaExpiracion(dias) {
//   const fecha = new Date();
//   fecha.setDate(fecha.getDate() + dias);
//   return fecha.toISOString().split("T")[0];
// }

// 📊 Consultar estado del proceso
export async function consultarProcesoPorMassiveId(massiveProcessingId, token = null) {
  try {
    if (!CONFIG.baseUrl) {
      throw new Error("AUTENTIC_API_BASE no configurado en .env");
    }

    const tokenToUse = token || await obtenerToken();
    const url = `${CONFIG.baseUrl}/v3/signing-process/${massiveProcessingId}`;
    
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${tokenToUse}`
      },
      timeout: 15000
    });

    console.log("📊 Estado del proceso consultado exitosamente");
    return data;

  } catch (error) {
    console.error("❌ Error consultando proceso:", error.response?.data || error.message);
    throw new Error(`Fallo al consultar estado del proceso: ${error.message}`);
  }
}

// 📥 Descargar archivos firmados
export async function descargarArchivosFirmados(processId, token = null) {
  try {
    if (!CONFIG.downloadEndpoint) {
      throw new Error("END_POINT_API_GET_FILE no configurado en .env");
    }

    const tokenToUse = token || await obtenerToken();
    const url = `${CONFIG.downloadEndpoint}/${processId}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${tokenToUse}`
      },
      timeout: 20000
    });

    const archivos = response.data?.body?.files || [];

    if (!archivos.length) {
      throw new Error("No se encontraron documentos firmados para este proceso");
    }

    console.log(`📄 Descargando ${archivos.length} documentos firmados...`);

    // Descargar archivos en paralelo con límite de tiempo
    const archivosDescargados = await Promise.all(
      archivos.map(async (doc, index) => {
        try {
          const binario = await axios.get(doc.url, {
            responseType: "arraybuffer",
            timeout: 30000
          });

          return {
            name: doc.name,
            buffer: Buffer.from(binario.data)
          };
        } catch (error) {
          console.error(`❌ Error descargando archivo ${index + 1}:`, error.message);
          throw new Error(`Fallo al descargar archivo: ${doc.name}`);
        }
      })
    );

    console.log("✅ Todos los archivos descargados exitosamente");
    return archivosDescargados;

  } catch (error) {
    console.error("❌ Error descargando archivos:", error.response?.data || error.message);
    throw new Error(`Fallo al descargar archivos firmados: ${error.message}`);
  }
}

export { obtenerToken };