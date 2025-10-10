// src\controllers\adjuntarConvenioController.js

import {
  obtenerToken as obtenerTokenAutentic,
  descargarArchivosFirmados
} from "../services/autenticService.js";

import { procesarArchivoConvenioService } from "../services/procesarArchivoConvenioService.js";

export async function adjuntarConvenio(req, res) {
  try {
    const { processId, nombre_inm, num_convenio, id_convenio } = req.body;

    if (!processId || !id_convenio) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
        detalle: "Se requiere 'processId' e 'id_convenio'"
      });
    }

    console.log("📥 Datos recibidos:", req.body);

    const tokenAutentic = await obtenerTokenAutentic();
    const archivos = await descargarArchivosFirmados(processId, tokenAutentic);

    const { resultados, errores } = await procesarArchivoConvenioService(
      id_convenio,
      nombre_inm,
      num_convenio,
      archivos
    );

    return res.status(200).json({
      mensaje: "Proceso completado",
      resultados,
      errores
    });

  } catch (error) {
    console.error("❌ Error en adjuntarConvenio:", error.message || error);
    return res.status(500).json({
      error: "Error interno al adjuntar convenio",
      detalle: error.message || error
    });
  }
}