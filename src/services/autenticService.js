// autenticService.js - OPTIMIZADO
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// 📦 Configuración desde .env
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

// 🔐 CACHÉ DE TOKEN (evita solicitar token en cada request)
let tokenCache = {
  token: null,
  expiracion: null
};

// ✅ Validar configuración al inicio
function validarConfiguracion() {
  const camposRequeridos = ['audience', 'clientId', 'clientSecret', 'signingUrl', 'enterpriseId', 'senderEmail', 'senderIdentification'];
  const camposFaltantes = camposRequeridos.filter(campo => !CONFIG[campo]);
  
  if (camposFaltantes.length > 0) {
    throw new Error(`Configuración incompleta en .env: ${camposFaltantes.join(', ')}`);
  }
}

// 🔄 Función para reintentar con backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      const isRateLimitError = error.response?.status === 429 || error.code === 'ECONNABORTED';
      
      if (isLastRetry || (!isRateLimitError && error.response?.status !== 500)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️ Reintento ${i + 1}/${maxRetries} después de ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 🔑 Obtener token de Autentic con CACHÉ
async function obtenerToken() {
  try {
    // ✅ Verificar si hay token en caché válido
    const ahora = Date.now();
    if (tokenCache.token && tokenCache.expiracion && ahora < tokenCache.expiracion) {
      console.log("🔑 Usando token en caché");
      return tokenCache.token;
    }

    validarConfiguracion();
    
    const tokenUrl = "https://authorizer.autenticsign.com/v2/authorizer/getToken";
    const payload = {
      audience: CONFIG.audience,
      grant_type: "client_credentials",
      client_id: CONFIG.clientId,
      client_secret: CONFIG.clientSecret
    };

    console.log("📤 Solicitando nuevo token de Autentic...");
    
    const response = await retryWithBackoff(async () => {
      return await axios.post(tokenUrl, payload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    if (!response.data?.access_token) {
      throw new Error("Token no recibido en la respuesta de Autentic");
    }

    // 💾 Guardar en caché (tokens de Autentic duran ~1 hora, guardamos por 50 min)
    tokenCache.token = response.data.access_token;
    tokenCache.expiracion = ahora + (50 * 60 * 1000); // 50 minutos

    console.log("🔑 Token obtenido y cacheado exitosamente");
    return tokenCache.token;

  } catch (error) {
    console.error("❌ Error obteniendo token:", error.response?.data || error.message);
    throw new Error(`Fallo al obtener token de Autentic: ${error.message}`);
  }
}

// 📊 Consultar estado del proceso con REINTENTOS
export async function consultarProcesoPorMassiveId(massiveProcessingId, token = null) {
  try {
    if (!CONFIG.baseUrl) {
      throw new Error("AUTENTIC_API_BASE no configurado en .env");
    }

    console.log(`🔍 Consultando proceso: ${massiveProcessingId}`);

    const resultado = await retryWithBackoff(async () => {
      const tokenToUse = token || await obtenerToken();
      const url = `${CONFIG.baseUrl}/v3/signing-process/${massiveProcessingId}`;
      
      return await axios.get(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        },
        timeout: 20000
      });
    }, 3, 2000); // 3 reintentos con delay inicial de 2 segundos

    console.log("✅ Estado del proceso consultado exitosamente");
    return resultado.data;

  } catch (error) {
    console.error("❌ Error consultando proceso:", error.response?.data || error.message);
    
    // Diferenciar tipos de error para mejor debugging
    if (error.response?.status === 404) {
      throw new Error(`Proceso no encontrado: ${massiveProcessingId}`);
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit excedido - demasiadas solicitudes");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Timeout al consultar proceso - intente nuevamente");
    }
    
    throw new Error(`Fallo al consultar estado del proceso: ${error.message}`);
  }
}

// 📤 Enviar proceso de firma a Autentic
export async function enviarParaFirma({ documentos, firmantes, numeroContrato, nombreSolicitante }, opciones = {}) {
  try {
    const mode = opciones.mode || "DEFAULT";
    const numeroConvenio = opciones.numeroConvenio || null;

    // ✅ Validaciones base
    if (!documentos?.length) throw new Error("Se requiere al menos un documento válido");
    if (!firmantes?.length) throw new Error("Se requiere al menos un firmante válido");
    if (!numeroContrato) throw new Error("Número de contrato es requerido");

    const token = await obtenerToken();

    // 🧩 Mensajes dinámicos
    let asunto = "";
    let mensaje = "";

    if (mode === "SOLO_CONVENIO") {
      asunto = `Firma convenio de firma digital ${numeroConvenio} - AutenTIC Sign`;
      mensaje = `Ha sido asignado como firmante del convenio de firma digital número ${numeroConvenio}, correspondiente a una solicitud generada por ${nombreSolicitante}. Por favor revise el documento adjunto y proceda con la firma digital para formalizar el convenio.`;
    } else {
      asunto = `Firma contrato de fianza ${numeroContrato} - AutenTIC Sign`;
      mensaje = `Ha sido asignado como firmante del contrato de fianza número ${numeroContrato}, correspondiente a una solicitud generada por ${nombreSolicitante}. Por favor revise los documentos adjuntos y proceda con la firma digital para continuar con el proceso de vinculación.`;
    }

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
          subject: asunto,
          message: mensaje,
          expirationDate: obtenerFechaExpiracion(30),
          order: true,
          sendEmail: true
        }
      ]
    };

    console.log(`📦 Enviando proceso a Autentic (${mode})...`);

    const resultado = await retryWithBackoff(async () => {
      return await axios.post(CONFIG.signingUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      });
    });

    const massiveProcessingId = resultado.data?.body?.massiveProcessingId;
    if (!massiveProcessingId) {
      throw new Error("Autentic no retornó un massiveProcessingId válido");
    }

    console.log(`✅ Proceso enviado exitosamente (${mode}). ID: ${massiveProcessingId}`);

    return {
      massiveProcessingId,
      raw: resultado.data
    };
  } catch (error) {
    console.error("❌ Error en enviarParaFirma:", error.response?.data || error.message);
    if (error.code === "ECONNABORTED") {
      throw new Error("Timeout al conectar con Autentic - intente nuevamente");
    }
    throw new Error(`Fallo al enviar proceso de firma: ${error.message}`);
  }
}

// 🕐 Calcular fecha de expiración en formato YYYY-MM-DD
function obtenerFechaExpiracion(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
}

// 📥 Descargar archivos firmados
export async function descargarArchivosFirmados(processId, token = null) {
  try {
    if (!CONFIG.downloadEndpoint) {
      throw new Error("END_POINT_API_GET_FILE no configurado en .env");
    }

    const tokenToUse = token || await obtenerToken();
    const url = `${CONFIG.downloadEndpoint}/${processId}`;
    
    const response = await retryWithBackoff(async () => {
      return await axios.get(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        },
        timeout: 20000
      });
    });

    const archivos = response.data?.body?.files || [];

    if (!archivos.length) {
      throw new Error("No se encontraron documentos firmados para este proceso");
    }

    console.log(`📄 Descargando ${archivos.length} documentos firmados...`);

    const archivosDescargados = await Promise.all(
      archivos.map(async (doc, index) => {
        try {
          const binario = await retryWithBackoff(async () => {
            return await axios.get(doc.url, {
              responseType: "arraybuffer",
              timeout: 30000
            });
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