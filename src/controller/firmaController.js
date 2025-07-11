// controllers/firmaController.js
import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";

export async function ejecutarProcesoFirma(req, res) {
  try {
    const datos = req.body; // Requiere tipo_persona, ciudad, etc.
    console.log("📬 Webhook recibido de HubSpot", datos);

    const firmantes = await obtenerFirmantes(datos);
    const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);

    const resultado = await enviarParaFirma(base64Reglamento, base64PDF, firmantes);
    res.status(200).json({ message: "Proceso de firma iniciado", resultado });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);
    res.status(500).json({ error: "Error al iniciar el proceso de firma" });
  }
}
