// src/controllers/emailReminderController.js
import Proceso from "../models/procesoModel.js";
import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js";
import determinarFirmantePendiente from "../utils/determinarFirmantePendiente.js";

export const gestionarRecordatorioDesdeHubspot = async (req, res) => {
  try {
    const { processId, numContrato, nombreCliente, tipo_contrato } = req.body;

    if (!processId || !numContrato || !nombreCliente || !tipo_contrato) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const proceso = await Proceso.findOne({ processId });
    if (!proceso) {
      return res.status(404).json({ error: "No se encontró el proceso con ese ID" });
    }

    const { firmante, asunto } = proceso;

    const firmantePendiente = determinarFirmantePendiente(asunto, firmante);
    if (!firmantePendiente) {
      return res.status(200).json({ message: "✅ Ya firmaron todos. No se envía recordatorio." });
    }

    await enviarCorreoRecordatorio(
      firmantePendiente,
      processId,
      numContrato,
      nombreCliente,
      asunto
    );

    res.status(200).json({ message: `📧 Recordatorio enviado a ${firmantePendiente}` });

  } catch (error) {
    console.error("❌ Error enviando recordatorio:", error.message);
    res.status(500).json({ error: error.message });
  }
};
