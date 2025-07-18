// src/controllers/emailReminderDirectorController.js

import Proceso from "../models/procesoModel.js";
import Director from "../models/directorModel.js"; // debes crear este modelo
import enviarCorreo from "../utils/enviarCorreoDirector.js"; // ya lo usas para enviar
import emailRemember from "../templates/templateEmailDirectores.js";

export const enviarRecordatorioADirector = async (req, res) => {
  try {
    const { zona, processId, numContrato, nombreCliente } = req.body;

    // 1️⃣ Buscar el proceso
    const proceso = await Proceso.findOne({ processId });
    if (!proceso) return res.status(404).json({ error: "Proceso no encontrado" });

    // 2️⃣ Verificar que quien firmó fue Lilian
    if (
      proceso.firmante !== "Lilian Paola Holguín Orrego" ||
      proceso.asunto !== "Notificación de firma en Autentic Sign"
    ) {
      return res.status(200).json({ message: "No aplica para envío a director comercial aún." });
    }

    // 3️⃣ Buscar director comercial por zona, con fallback a "Regiones"
    let zonaBusqueda = zona;
    if (zona !== "Antioquia" && zona !== "Centro") {
        zonaBusqueda = "Regiones";
    }

    const director = await Director.findOne({ zona: zonaBusqueda });
    if (!director) {
        return res.status(404).json({ error: `No se encontró director para la zona: ${zonaBusqueda}` });
    }

    const fechaEnvio = new Date().toLocaleDateString("es-CO");

    // 4️⃣ Construir HTML
    const html = emailRemember(
      `${director.name} ${director.last_name}`,
      numContrato,
      nombreCliente,
      fechaEnvio,
      proceso.firmante
    );

    // 5️⃣ Enviar correo
    await enviarCorreo(director.email, html);

    res.status(200).json({ message: "✅ Correo enviado al director comercial." });

  } catch (error) {
    console.error("❌ Error enviando recordatorio a director:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
