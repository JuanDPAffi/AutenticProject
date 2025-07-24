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

    // ✅ Validación robusta de campos obligatorios
    const camposRequeridos = ['tipo_persona', 'numero_de_contrato', 'correo'];
    const camposFaltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        error: "Faltan datos obligatorios", 
        camposFaltantes,
        datosRecibidos: Object.keys(datos)
      });
    }

    // 🔧 Transformar número de celular
    if (datos.numero_celular?.startsWith?.("+57")) {
      const celularOriginal = datos.numero_celular;
      datos.numero_celular = datos.numero_celular.substring(3);
      console.log(`📞 Celular transformado: ${celularOriginal} -> ${datos.numero_celular}`);
    }

    // 🧠 Determinar si incluir convenio
    const incluirConvenio = ["si", "sí"].includes(
      (datos.convenio_firma_digital || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    );

    console.log(`📋 Convenio digital: ${incluirConvenio ? "SÍ" : "NO"}`);

    // 🔄 Generar todos los documentos necesarios
    const [base64Contrato, base64Reglamento, base64Convenio] = await Promise.all([
      // 1️⃣ Generar contrato
      generarContratoPDF(datos),
      
      // 2️⃣ Leer reglamento
      (async () => {
        const reglamentoPath = path.resolve("src/contratos/REGLAMENTO_DE_FIANZA_AFFI.pdf");
        if (!fs.existsSync(reglamentoPath)) {
          throw new Error(`Archivo de reglamento no encontrado: ${reglamentoPath}`);
        }
        return fs.readFileSync(reglamentoPath).toString("base64");
      })(),
      
      // 3️⃣ Generar convenio (si es necesario)
      incluirConvenio ? generarConvenioPDF(datos) : Promise.resolve(null)
    ]);

    // 4️⃣ Obtener firmantes
    const firmantes = await obtenerFirmantes(datos, incluirConvenio);

    // 5️⃣ Preparar datos para el servicio
    const datosEnvio = {
      documentos: [
        {
          content: base64Reglamento,
          fileName: "REGLAMENTO_DE_FIANZA_AFFI.pdf"
        },
        {
          content: base64Contrato,
          fileName: `Contrato_${datos.numero_de_contrato}.pdf`
        }
      ],
      firmantes,
      numeroContrato: datos.numero_de_contrato,
      nombreSolicitante: datos.nombre_inmobiliaria || datos.nombre_establecimiento_comercio || "Solicitante"
    };

    // Agregar convenio si existe
    if (base64Convenio) {
      datosEnvio.documentos.push({
        content: base64Convenio,
        fileName: `Convenio_${datos.numero_de_contrato}.pdf`
      });
    }

    console.log(`📄 Enviando ${datosEnvio.documentos.length} documentos a Autentic`);

    // 6️⃣ Enviar a Autentic
    const { massiveProcessingId, raw: resultado } = await enviarParaFirma(datosEnvio);

    if (!massiveProcessingId) {
      throw new Error("Autentic no retornó massiveProcessingId válido");
    }

    console.log("✅ Proceso iniciado con ID:", massiveProcessingId);

    return res.status(200).json({
      success: true,
      massiveProcessingId,
      message: "Proceso de firma iniciado correctamente",
      documentosEnviados: datosEnvio.documentos.length,
      firmantes: firmantes.length,
      resultado
    });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);
    
    return res.status(500).json({
      success: false,
      error: "Error interno al iniciar el proceso de firma",
      detalle: error.message,
      timestamp: new Date().toISOString()
    });
  }
}