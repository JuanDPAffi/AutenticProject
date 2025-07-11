// controllers/firmaController.js
import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";
import { obtenerAccessTokenHubSpot, obtenerDatosVinculacion } from "../services/hubspotService.js";

export async function ejecutarProcesoFirma(req, res) {
  try {
    let datos = req.body;

    // Si solo viene el ID de la vinculación, consultamos en HubSpot
    if (!datos.tipo_persona && datos.idVinculacion) {
      console.log("🔎 Consultando datos en HubSpot para idVinculacion:", datos.idVinculacion);
      const token = await obtenerAccessTokenHubSpot();
      const propiedades = await obtenerDatosVinculacion(datos.idVinculacion, token);
      datos = propiedades; // sobreescribimos con los datos obtenidos de HubSpot
    }

    console.log("📬 Datos obtenidos:", datos);

    // Modo debug: si está activo, solo mostrar los datos y salir
    if (datos.debug === true || datos.debug === "true") {
      console.log("🐞 Modo DEBUG activado, no se genera contrato ni se envía a Autentic");
      return res.status(200).json({ message: "DEBUG activado", datosRecibidos: datos });
    }

    const firmantes = await obtenerFirmantes(datos);
    const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);

    const resultado = await enviarParaFirma(base64Reglamento, base64PDF, firmantes);
    res.status(200).json({ message: "Proceso de firma iniciado", resultado });
  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);
    res.status(500).json({ error: "Error al iniciar el proceso de firma" });
  }
}
