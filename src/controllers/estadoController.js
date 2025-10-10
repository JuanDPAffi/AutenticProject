// controllers/estadoController.js - OPTIMIZADO CON RATE LIMITER
import { consultarProcesoPorMassiveId, obtenerToken } from "../services/autenticService.js";
import rateLimiter from "../middlewares/rateLimiter.js";

export async function consultarYActualizarEstadoProceso(req, res) {
  const startTime = Date.now();
  
  try {
    const { massiveProcessingId } = req.body;

    // Validación de entrada
    if (!massiveProcessingId) {
      return res.status(400).json({ 
        error: "Falta el massiveProcessingId",
        ProcessId: null,
        ProcessEstatus: "ERROR"
      });
    }

    console.log(`🔍 [${new Date().toISOString()}] Consultando estado del proceso: ${massiveProcessingId}`);

    // ✅ Usar rate limiter para evitar sobrecarga
    const resultado = await rateLimiter.add(async () => {
      // Obtener token una sola vez (se cachea automáticamente)
      const token = await obtenerToken();
      
      // Consultar proceso con reintentos automáticos
      return await consultarProcesoPorMassiveId(massiveProcessingId, token);
    });

    const processData = resultado?.body?.processes?.[0];
    const processId = processData?.processId || null;
    const status = processData?.status || "UNKNOWN";

    const duration = Date.now() - startTime;
    console.log(`✅ [${new Date().toISOString()}] Proceso consultado en ${duration}ms`);
    console.log(`   📋 ProcessId: ${processId}`);
    console.log(`   📊 Estado: ${status}`);

    // ⚠️ Alerta si no viene processId
    if (!processId) {
      console.warn(`⚠️ ADVERTENCIA: No se encontró processId en la respuesta`);
      console.warn(`   Estructura recibida:`, JSON.stringify(resultado?.body, null, 2));
    }

    return res.status(200).json({
      ProcessId: processId,
      ProcessEstatus: status,
      timestamp: new Date().toISOString(),
      responseTime: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || "Error desconocido";
    
    console.error(`❌ [${new Date().toISOString()}] Error después de ${duration}ms:`, errorMessage);

    // Diferenciar tipos de error para respuestas más útiles
    if (errorMessage.includes("Proceso no encontrado")) {
      return res.status(404).json({
        error: "Proceso no encontrado",
        ProcessId: null,
        ProcessEstatus: "NOT_FOUND",
        detalle: errorMessage,
        timestamp: new Date().toISOString()
      });
    }

    if (errorMessage.includes("Rate limit")) {
      return res.status(429).json({
        error: "Demasiadas solicitudes - intente nuevamente en unos segundos",
        ProcessId: null,
        ProcessEstatus: "RATE_LIMITED",
        detalle: errorMessage,
        timestamp: new Date().toISOString()
      });
    }

    if (errorMessage.includes("Timeout")) {
      return res.status(504).json({
        error: "Tiempo de espera agotado",
        ProcessId: null,
        ProcessEstatus: "TIMEOUT",
        detalle: errorMessage,
        timestamp: new Date().toISOString()
      });
    }

    // Error genérico
    return res.status(500).json({
      error: "Error interno al consultar estado del proceso",
      ProcessId: null,
      ProcessEstatus: "ERROR",
      detalle: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}