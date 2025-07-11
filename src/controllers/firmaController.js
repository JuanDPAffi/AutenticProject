import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";

export async function ejecutarProcesoFirma(req, res) {
  try {
    const datos = req.body;
    console.log("📥 Datos recibidos del webhook:", datos);

    // Validar campos obligatorios
    if (!datos.tipo_persona || !datos.ciudad_inmobiliaria || !datos.numero_de_contrato) {
      return res.status(400).json({ error: "Faltan campos obligatorios", datosRecibidos: datos });
    }

    // Identificar si es persona natural o jurídica
    const tipoPersona = datos.tipo_persona.toLowerCase();

    if (tipoPersona === "natural") {
      datos.tipoContrato = "natural";
    } else if (tipoPersona === "juridica" || tipoPersona === "jurídica") {
      datos.tipoContrato = "juridico";
    } else {
      return res.status(400).json({ error: "Tipo de persona no válido", tipo_persona: datos.tipo_persona });
    }

    // Generar y convertir contrato a PDF
    const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);

    // Obtener firmantes desde Mongo o datos locales
    const firmantes = await obtenerFirmantes(datos);

    // Enviar contrato a Autentic
    const resultado = await enviarParaFirma(base64Reglamento, base64PDF, firmantes);

    res.status(200).json({ message: "Proceso de firma iniciado", resultado });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);
    res.status(500).json({ error: "Error al iniciar el proceso de firma" });
  }
}
