// src/services/autenticService.js

import axios from "axios";
import dotenv from "dotenv";
import TokenManager from "./tokenManager.js";

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

// 🔐 Token Manager (maneja caché y race conditions)
const tokenManager = new TokenManager(CONFIG);

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
      const is401Error = error.response?.status === 401;
      const isRateLimitError = error.response?.status === 429 || error.code === 'ECONNABORTED';
      
      // 🔑 Si es error 401, invalidar token
      if (is401Error) {
        tokenManager.invalidar();
        console.log("🔄 Token inválido detectado (401)");
      }
      
      if (isLastRetry || (!isRateLimitError && !is401Error && error.response?.status !== 500)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️ Reintento ${i + 1}/${maxRetries} después de ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 🔑 Obtener token de Autentic (wrapper para TokenManager)
async function obtenerToken() {
  return await tokenManager.obtenerToken();
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
      // ✅ CRÍTICO: Obtener token DENTRO del reintento (no fuera)
      const token = await obtenerToken();
      
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

// 📊 Consultar estado del proceso con REINTENTOS
export async function consultarProcesoPorMassiveId(massiveProcessingId, token = null) {
  try {
    if (!CONFIG.baseUrl) {
      throw new Error("AUTENTIC_API_BASE no configurado en .env");
    }

    console.log(`🔍 Consultando proceso: ${massiveProcessingId}`);

    const resultado = await retryWithBackoff(async () => {
      // ✅ IMPORTANTE: Siempre obtener token fresco (usa caché si es válido)
      const tokenToUse = await obtenerToken();
      const url = `${CONFIG.baseUrl}/v3/signing-process/${massiveProcessingId}`;
      
      return await axios.get(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        },
        timeout: 20000
      });
    }, 3, 2000);

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