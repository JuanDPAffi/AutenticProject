// services/contratoService.js
import fs from "fs";
import { execSync } from "child_process";
import libre from "libreoffice-convert";
import { promisify } from "util";
const convertAsync = promisify(libre.convert);

export async function generarContratoPDF(datos) {
  try {
    // 1. Escribir los datos recibidos en datosTemp.json
    const rutaJson = "contratos/datosTemp.json";
    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2));
    console.log("📦 Datos del contrato guardados en datosTemp.json");

    // 2. Determinar si es contrato jurídico o natural
    const tipo = datos.tipo_persona?.toLowerCase();
    let scriptContrato = "";

    if (tipo === "juridica") {
      scriptContrato = "contratos/contratoJuridico.js";
    } else if (tipo === "natural") {
      scriptContrato = "contratos/contratoNatural.js";
    } else {
      throw new Error(`Tipo de persona no válido: ${datos.tipo_persona}`);
    }

    // 3. Ejecutar el script adecuado para generar el contrato DOCX
    console.log(`📝 Generando contrato DOCX con: ${scriptContrato}`);
    execSync(`node ${scriptContrato}`, { stdio: "inherit" });

    // 4. Convertir DOCX a PDF
    console.log("📄 Convirtiendo DOCX a PDF...");
    const docxBuffer = fs.readFileSync("Contrato_Fianza.docx");
    const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
    fs.writeFileSync("Contrato_Fianza.pdf", pdfBuffer);

    // 5. Leer reglamento y codificar en base64
    const reglamentoBuffer = fs.readFileSync("contratos/REGLAMENTO DE FIANZA AFFI.pdf");
    const base64Reglamento = reglamentoBuffer.toString("base64");
    const base64PDF = pdfBuffer.toString("base64");

    return [base64PDF, base64Reglamento];
  } catch (error) {
    console.error("❌ Error generando contrato PDF:", error);
    throw error;
  }
}
