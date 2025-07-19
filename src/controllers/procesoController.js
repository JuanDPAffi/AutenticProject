// src/controllers/procesoController.js

import Proceso from "../models/procesoModel.js";
import getDatosEmailRemember from "../utils/getDatosEmailRemember.js";

export const registrarProcesoDesdeCorreo = async (req, res) => {
  try {
    // ----> CAMBIO 1: Extrae 'bodyHtml' Y TAMBIÉN 'asunto' de la petición.
    const { bodyHtml, asunto } = req.body;

    // ----> CAMBIO 2: Valida que ambos campos existan.
    if (!bodyHtml || !asunto) {
      return res.status(400).json({ error: "Los campos 'bodyHtml' y 'asunto' son requeridos" });
    }

    // ----> CAMBIO 3: Pasa AMBOS valores a la función de utilidad.
    const datos = getDatosEmailRemember(bodyHtml, asunto);
    
    // Ahora 'datos' ya no contendrá el asunto, así que lo extraemos de la variable que ya tenemos
    const { processId, firmante, fecha, modificado } = datos;

    if (!processId) { // Ya no necesitamos verificar el asunto aquí porque getDatosEmailRemember ya lo hizo
      return res.status(400).json({ error: "Faltan datos clave (processId)" });
    }

    // Buscar si ya existe
    const procesoExistente = await Proceso.findOne({ processId });

    // El resto de tu lógica funciona con estos cambios
    if (!procesoExistente) {
      await Proceso.create({
        processId,
        asunto: asunto.trim(),
        firmante,
        fecha,
        modificado,
        zona: "",
        correoDirector: false
      });
    } else {
      await Proceso.updateOne({ processId }, {
        $set: {
          asunto: asunto.trim(),
          firmante,
          modificado
        }
      });
    }

    // Creamos un objeto de respuesta que incluya el asunto
    const datosRespuesta = { processId, asunto: asunto.trim(), firmante, fecha, modificado };
    res.status(200).json({ message: "✅ Proceso registrado correctamente", datos: datosRespuesta });

  } catch (error) {
    console.error("❌ Error:", error.message);
    // Cambiamos a 400 si el error es por "Asunto no reconocido"
    if (error.message.includes("Asunto no reconocido")) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};