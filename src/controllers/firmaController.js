// src/controllers/firmaController.js

import { generarContratoPDF, generarConvenioPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";
import { obtenerNumeroConvenioPorContrato } from "../services/convenioService.js";
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

    // 🔄 Generar documentos (el convenio también lo guarda en la BD)
    const [base64Contrato, base64Reglamento, base64Convenio] = await Promise.all([
      generarContratoPDF(datos),
      (async () => {
        const reglamentoPath = path.resolve("src/contratos/REGLAMENTO_DE_FIANZA_AFFI.pdf");
        if (!fs.existsSync(reglamentoPath)) {
          throw new Error(`Archivo de reglamento no encontrado: ${reglamentoPath}`);
        }
        return fs.readFileSync(reglamentoPath).toString("base64");
      })(),
      incluirConvenio ? generarConvenioPDF(datos) : Promise.resolve(null)
    ]);

    // 🔍 Solo ahora buscamos el número de convenio generado
    let numeroConvenio = null;
    if (incluirConvenio) {
      numeroConvenio = await obtenerNumeroConvenioPorContrato(datos.numero_de_contrato);
      if (!numeroConvenio) {
        throw new Error(`No se encontró número de convenio después de generarlo para el contrato ${datos.numero_de_contrato}`);
      }
      console.log(`🔢 Número de convenio encontrado: ${numeroConvenio}`);
    }

    // 🧾 Obtener firmantes
    const firmantes = await obtenerFirmantes(datos, incluirConvenio);

    // 📦 Preparar los documentos para envío
    const datosEnvio = {
      documentos: [
        {
          content: base64Reglamento,
          fileName: "REGLAMENTO_DE_FIANZA_AFFI.pdf"
        },
        {
          content: base64Contrato,
          fileName: `CONTRATO_DE_FIANZA_COLECTIVA_${datos.numero_de_contrato}.pdf`
        }
      ],
      firmantes,
      numeroContrato: datos.numero_de_contrato,
      nombreSolicitante: datos.nombre_inmobiliaria || datos.nombre_establecimiento_comercio || "Solicitante"
    };

    // ➕ Agregar convenio al envío (con número en el nombre)
    if (base64Convenio) {
      datosEnvio.documentos.push({
        content: base64Convenio,
        fileName: `CONVENIO_FIRMA_DIGITAL_${numeroConvenio}.pdf`
      });
    }

    console.log(`📄 Enviando ${datosEnvio.documentos.length} documentos a Autentic`);

    // 📤 Enviar a Autentic
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
      numeroConvenio: numeroConvenio || null,
      resultado
    });
  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);

    // Detectar si ya existe convenio generado
    if (error.message?.includes?.("Ya existe un convenio generado para este contrato:")) {
      const numeroContrato = req.body?.numero_de_contrato || "Desconocido";
      const match = error.message.match(/FD\d+/);
      const numeroConvenio = match ? match[0] : "Desconocido";

      return res.status(409).json({
        success: false,
        error: "El contrato ya tiene un convenio generado",
        numeroContrato,
        numeroConvenio,
        detalle: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Otro tipo de error
    return res.status(500).json({
      success: false,
      error: "Error interno al iniciar el proceso de firma",
      detalle: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
