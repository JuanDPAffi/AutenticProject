// controllers/firmaController.js
import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";
import path from "path";
import fs from "fs";

export async function ejecutarProcesoFirma(req, res) {
  try {
    const datos = req.body;
    console.log("📥 Datos recibidos del webhook:", datos);

    // Validación mínima de campos obligatorios
    if (!datos.tipo_persona || !datos.numero_de_contrato || !datos.correo) {
      return res.status(400).json({ error: "Faltan datos obligatorios", datos });
    }

    // 1. Generar contrato DOCX, convertir a PDF y base64
    const base64Contrato = await generarContratoPDF(datos);

    // 2. Leer reglamento desde /src/contratos/ y convertir a base64
    const reglamentoPath = path.resolve("src/contratos/REGLAMENTO_DE_FIANZA_AFFI.pdf");
    if (!fs.existsSync(reglamentoPath)) {
      throw new Error(`No se encontró el archivo del reglamento en: ${reglamentoPath}`);
    }

    const reglamentoBuffer = fs.readFileSync(reglamentoPath);
    const base64Reglamento = reglamentoBuffer.toString("base64");

    // 3. Obtener firmantes dinámicamente
    const firmantes = await obtenerFirmantes(datos);

    // 4. Enviar a Autentic
    const resultado = await enviarParaFirma(base64Reglamento, base64Contrato, firmantes);

    return res.status(200).json({
      message: "✅ Proceso de firma iniciado correctamente",
      resultado
    });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error.message || error);
    return res.status(500).json({
      error: "Error interno al iniciar el proceso de firma",
      detalle: error.message || error
    });
  }
}
