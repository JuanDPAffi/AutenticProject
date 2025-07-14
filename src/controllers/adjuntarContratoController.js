import {
  obtenerToken as obtenerTokenAutentic,
  descargarArchivosFirmados
} from "../services/autenticService.js";

import { procesarArchivoService } from "../services/procesarArchivoService.js";

export async function adjuntarContrato(req, res) {
  try {
    const { processId, nombre_inm, num_contrato, id_vinculacion } = req.body;

    if (!processId || !id_vinculacion) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
        detalle: "Se requiere 'processId' e 'id_vinculacion'"
      });
    }

    console.log("📥 Datos recibidos:", req.body);

    const tokenAutentic = await obtenerTokenAutentic();
    const archivos = await descargarArchivosFirmados(processId, tokenAutentic);

    const { resultados, errores } = await procesarArchivoService(
      id_vinculacion,
      nombre_inm,
      num_contrato,
      archivos
    );

    return res.status(200).json({
      mensaje: "Proceso completado",
      resultados,
      errores
    });

  } catch (error) {
    console.error("❌ Error en adjuntarContrato:", error.message || error);
    return res.status(500).json({
      error: "Error interno al adjuntar contrato",
      detalle: error.message || error
    });
  }
}