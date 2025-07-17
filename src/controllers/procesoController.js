// src/controllers/procesoController.js
import Proceso from "../models/procesoModel.js";
import getDatosEmailRemember from "../utils/getDatosEmailRemember.js";
import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js"; // esta función la creamos abajo

export const registrarProcesoDesdeCorreo = async (req, res) => {
  try {
    const { bodyHtml } = req.body;

    if (!bodyHtml) {
      return res.status(400).json({ error: "bodyHtml es requerido" });
    }

    const datos = getDatosEmailRemember(bodyHtml); // extrae processId, asunto, firmante, fecha, modificado
    const { processId, asunto, firmante, fecha, modificado } = datos;

    if (!processId || !asunto) {
      return res.status(400).json({ error: "Faltan datos clave" });
    }

    // Buscar si ya existe
    const procesoExistente = await Proceso.findOne({ processId });

    if (!procesoExistente) {
      await Proceso.create({ processId, asunto, firmante, fecha, modificado });
    } else {
      await Proceso.updateOne({ processId }, { $set: { asunto, firmante, modificado } });
    }

    // 📧 Enviar recordatorio al firmante pendiente
    const pendiente = determinarFirmantePendiente(asunto, firmante);
    if (pendiente) {
      await enviarCorreoRecordatorio(pendiente, processId);
      console.log(`📧 Recordatorio enviado a ${pendiente}`);
    }

    res.status(200).json({ message: "✅ Proceso registrado y recordatorio gestionado", datos });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
