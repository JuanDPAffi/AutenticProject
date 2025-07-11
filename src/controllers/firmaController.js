import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";

export async function ejecutarProcesoFirma(req, res) {
  try {
    const datos = req.body;
    console.log("📥 Datos recibidos del webhook:", datos);

    // Validar campos obligatorios mínimos
    if (!datos.tipo_persona || !datos.ciudad_inmobiliaria || !datos.numero_de_contrato) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
        datosRecibidos: datos
      });
    }

    // Normalizar tipo_persona para evitar errores por tildes o mayúsculas
    const tipoPersona = (datos.tipo_persona || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // elimina tildes

    if (tipoPersona === "natural") {
      datos.tipoContrato = "natural";
    } else if (tipoPersona === "juridica") {
      datos.tipoContrato = "juridico";
    } else {
      return res.status(400).json({
        error: "Tipo de persona no válido",
        tipo_persona: datos.tipo_persona
      });
    }

    // ✅ Generar contrato y reglamento en base64 PDF
    const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);

    // ✅ Obtener firmantes (cliente + comercial [+ gerencia])
    const firmantes = await obtenerFirmantes({ ...datos, tipo_persona: tipoPersona });

    if (!firmantes || !Array.isArray(firmantes) || firmantes.length < 2) {
      return res.status(500).json({ error: "No se pudieron obtener los firmantes correctamente." });
    }

    // ✅ Enviar para firma a Autentic
    const resultado = await enviarParaFirma(base64Reglamento, base64PDF, firmantes);

    return res.status(200).json({
      message: "Proceso de firma iniciado correctamente",
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
