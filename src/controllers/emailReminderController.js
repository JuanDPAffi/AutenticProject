// src/controllers/emailReminderController.js

import Proceso from "../models/procesoModel.js";
import Director from "../models/directorModel.js";
import enviarCorreoDirector from "../utils/enviarCorreoDirector.js";
import emailDirectorTemplate from "../templates/templateEmailDirectores.js";

import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js";
import determinarFirmantePendiente from "../utils/determinarFirmantePendiente.js";
import emailGerentesTemplate from "../templates/templateEmailGerentes.js";

export const gestionarRecordatorioDesdeHubspot = async (req, res) => {
  try {
    const { zona, processId, numContrato, nombreCliente, tipo_contrato } = req.body;

    if (!zona || !processId || !numContrato || !nombreCliente || !tipo_contrato) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const proceso = await Proceso.findOne({ processId });
    if (!proceso) {
      return res.status(404).json({ error: "No se encontró el proceso con ese ID" });
    }

    const { firmante, asunto, correoDirector } = proceso;

    // 📌 1️⃣ Enviar recordatorio a gerencias si falta alguien por firmar
    const firmantePendiente = determinarFirmantePendiente(asunto, firmante);

    if (firmantePendiente) {
      await enviarCorreoRecordatorio(
        firmantePendiente,
        processId,
        numContrato,
        nombreCliente,
        asunto
      );
      console.log(`📧 Recordatorio enviado a ${firmantePendiente}`);
    }

    // 📌 2️⃣ Enviar correo al director si firmó Lilian o César y aún no se ha notificado
    const firmantesValidos = ["Lilian Paola Holguín Orrego", "Cesar Augusto Tezna Castaño"];

    if (firmantesValidos.includes(firmante) && correoDirector === false) {
      // 🔄 Normalizar la zona
      let zonaNormalizada = ["Antioquia", "Centro"].includes(zona) ? zona : "Regiones";

      // Buscar director por zona normalizada
      const director = await Director.findOne({ zona: zonaNormalizada });
      if (!director) {
        return res.status(404).json({ error: `No se encontró director para la zona: ${zonaNormalizada}` });
      }

      const fechaEnvio = new Date().toLocaleDateString("es-CO");

      const html = emailDirectorTemplate(
        `${director.name} ${director.last_name}`,
        numContrato,
        nombreCliente,
        fechaEnvio,
        firmante
      );

      await enviarCorreoDirector(director.email, html);

      // ✅ Marcar como enviado y guardar zona ya normalizada
      proceso.correoDirector = true;
      proceso.zona = zonaNormalizada;
      await proceso.save();

      console.log("✅ Correo enviado al director");
    }

    return res.status(200).json({ message: "✅ Flujo de recordatorio procesado correctamente" });

  } catch (error) {
    console.error("❌ Error en flujo de recordatorio:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
