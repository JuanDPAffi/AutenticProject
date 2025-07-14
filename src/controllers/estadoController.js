// controllers/estadoController.js
import { consultarProcesoPorMassiveId, obtenerToken } from "../services/autenticService.js";

export async function consultarYActualizarEstadoProceso(req, res) {
  try {
    const { massiveProcessingId } = req.body;

    if (!massiveProcessingId) {
      return res.status(400).json({ error: "Falta el massiveProcessingId" });
    }

    console.log("🔍 Consultando estado del proceso para:", massiveProcessingId);

    const token = await obtenerToken();
    const proceso = await consultarProcesoPorMassiveId(massiveProcessingId, token);

    const processId = proceso?.body?.processId || null;
    const status = proceso?.body?.status || "UNKNOWN";

    return res.status(200).json({
      ProcessId: processId,
      ProcessEstatus: status
    });

  } catch (error) {
    console.error("❌ Error al consultar estado del proceso:", error.message || error);
    return res.status(500).json({
      error: "Error interno al consultar estado del proceso",
      detalle: error.message || error
    });
  }
}
