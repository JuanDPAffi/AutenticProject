// src/controllers/emailReminderController.js

import Proceso from "../models/procesoModel.js";
import Director from "../models/directorModel.js";
import { Gerente } from "../models/gerenteModel.js";
import enviarCorreoDirector from "../utils/enviarCorreoDirector.js";
import emailDirectorTemplate from "../templates/templateEmailDirectores.js";

import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js";
import determinarFirmantePendiente from "../utils/determinarFirmantePendiente.js";

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
    
    // 🔄 Determinar si hay convenio basado en el POST request
    const convenioTexto = (req.body.convenio_firma_digital || "").toLowerCase().trim();
    const tieneConvenio = ["sí", "si", "Sí", "Si"].includes(req.body.convenio_firma_digital?.trim()) || convenioTexto === "si" || convenioTexto === "sí";
    
    // 💾 Guardar el campo convenio como booleano
    proceso.convenio = tieneConvenio;
    await proceso.save();
    
    console.log(`✅ Campo convenio actualizado a: ${tieneConvenio} (basado en: "${req.body.convenio_firma_digital}")`);

    // 🔍 Buscar si el firmante actual es un gerente para obtener su cédula
    let cedulaFirmante = null;
    
    if (firmante) {
      // Buscar gerente por nombre completo
      const gerente = await Gerente.findOne({
        $or: [
          { $expr: { $eq: [{ $concat: ["$name", " ", "$last_name"] }, firmante.trim()] } },
          { $expr: { $eq: [{ $concat: ["$last_name", " ", "$name"] }, firmante.trim()] } }
        ]
      });
      
      if (gerente) {
        cedulaFirmante = gerente.cc?.toString();
        console.log(`🔍 Gerente encontrado: ${gerente.name} ${gerente.last_name} - CC: ${cedulaFirmante}`);
      } else {
        console.log(`Firmante "${firmante}" no es un gerente registrado (probablemente cliente)`);
      }
    }

    // 📌 1️⃣ Enviar recordatorio a gerencias si falta alguien por firmar
    const firmantePendiente = determinarFirmantePendiente(
      asunto, 
      cedulaFirmante, 
      proceso.convenio // Ahora usamos el campo booleano
    );

    console.log(`🔍 Debug - Firmante: ${firmante}, Cédula: ${cedulaFirmante}, Convenio: ${proceso.convenio}, Pendiente: ${firmantePendiente}`);

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

    // Enviar correo al director si firmó Lilian o César y aún no se ha notificado
    const ccValidos = ["1112956229", "94492994"]; // Lilian, Cesar

    if (ccValidos.includes(cedulaFirmante) && correoDirector === false) {
      // Normalizar la zona
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