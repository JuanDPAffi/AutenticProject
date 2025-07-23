// controllers/firmaController.js
import { generarContratoPDF, generarConvenioPDF } from "../services/contratoService.js";
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

    // 🔧 Validar y transformar número de celular
    if (
      datos.numero_celular &&
      typeof datos.numero_celular === "string" &&
      datos.numero_celular.startsWith("+57")
    ) {
      const celularOriginal = datos.numero_celular;
      datos.numero_celular = datos.numero_celular.substring(3);
      console.log(`📞 Celular transformado: ${celularOriginal} -> ${datos.numero_celular}`);
    }

    // 🧠 Verificar si debe incluir convenio
    const incluirConvenio = ["si", "sí"].includes(
      (datos.convenio_firma_digital || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tilde
        .trim()
    );

    // 1️⃣ Generar contrato PDF
    const base64Contrato = await generarContratoPDF(datos);

    // 2️⃣ Leer reglamento
    const reglamentoPath = path.resolve("src/contratos/REGLAMENTO_DE_FIANZA_AFFI.pdf");
    if (!fs.existsSync(reglamentoPath)) {
      throw new Error(`No se encontró el archivo del reglamento en: ${reglamentoPath}`);
    }
    const reglamentoBuffer = fs.readFileSync(reglamentoPath);
    const base64Reglamento = reglamentoBuffer.toString("base64");

    // 3️⃣ Generar convenio (opcional)
    let base64Convenio = null;
    if (incluirConvenio) {
      console.log("📄 Generando convenio digital...");
      base64Convenio = await generarConvenioPDF(datos); // esta función debe retornar el PDF codificado en base64
    }

    // 4️⃣ Obtener firmantes
    const firmantes = await obtenerFirmantes(datos, incluirConvenio);

    // 5️⃣ Armar lista de archivos
    const archivos = [
      {
        nombre: `Contrato_${datos.numero_de_contrato}.pdf`,
        base64: base64Contrato,
      },
      {
        nombre: "REGLAMENTO_DE_FIANZA_AFFI.pdf",
        base64: base64Reglamento,
      },
    ];

    if (base64Convenio) {
      archivos.push({
        nombre: `Convenio_${datos.numero_de_contrato}.pdf`,
        base64: base64Convenio,
      });
    }

    // 6️⃣ Extraer los documentos por separado
    const base64ReglamentoFinal = archivos.find(a => a.nombre === "REGLAMENTO_DE_FIANZA_AFFI.pdf")?.base64;
    const base64ContratoFinal = archivos.find(a => a.nombre?.startsWith("Contrato_"))?.base64;
    const base64ConvenioFinal = archivos.find(a => a.nombre?.startsWith("Convenio_"))?.base64;

    // 🧪 Validar que existan
    if (!base64ReglamentoFinal || !base64ContratoFinal || (incluirConvenio && !base64ConvenioFinal)) {
      throw new Error("Faltan uno o más documentos base64 para enviar a Autentic.");
    }

    // 6️⃣ Enviar a Autentic (con los documentos como strings separados)
    const { massiveProcessingId, raw: resultado } = await enviarParaFirma(
      base64ReglamentoFinal,
      base64ContratoFinal,
      base64ConvenioFinal || "", // si no hay convenio, mandamos string vacío
      firmantes
    );

    if (!massiveProcessingId) {
      throw new Error("massiveProcessingId no retornado por Autentic");
    }

    console.log("🔁 massiveProcessingId recibido:", massiveProcessingId);

    return res.status(200).json({
      massiveProcessingId,
      message: "✅ Proceso de firma iniciado correctamente",
      resultado,
    });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error.message || error);
    return res.status(500).json({
      error: "Error interno al iniciar el proceso de firma",
      detalle: error.message || error,
    });
  }
}
