// src/controllers/procesoController.js
import Proceso from "../models/procesoModel.js";
import getDatosEmailRemember from "../utils/getDatosEmailRemember.js";
import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js";
import determinarFirmantePendiente from "../utils/determinarFirmantePendiente.js";

export const registrarProcesoDesdeCorreo = async (req, res) => {
  try {
    const { bodyHtml, asunto } = req.body;

    if (!bodyHtml || !asunto) {
      return res.status(400).json({ error: "❌ bodyHtml y asunto son requeridos" });
    }

    const datos = getDatosEmailRemember({ bodyHtml, asunto });
    const { processId, firmante, fecha, modificado } = datos;

    if (!processId || !asunto || !firmante) {
      return res.status(400).json({ error: "❌ Faltan datos clave" });
    }

    const procesoExistente = await Proceso.findOne({ processId });

    if (!procesoExistente) {
      await Proceso.create({ processId, asunto, firmante, fecha, modificado });
    } else {
      await Proceso.updateOne({ processId }, { $set: { asunto, firmante, modificado } });
    }

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
