// services/contratoService.js
import fs from "fs";
import { execSync } from "child_process";
import libre from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(libre.convert);

export async function generarContratoPDF(datos) {
  try {
    // Ejecuta script que usa docx para generar contrato
    console.log("📝 Generando contrato DOCX...");
    execSync("node contratos/contratoJuridico.js", { stdio: "inherit" });

    // Convierte DOCX a PDF
    console.log("📄 Convirtiendo DOCX a PDF...");
    const docxBuffer = fs.readFileSync("Contrato_Fianza.docx");
    const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
    fs.writeFileSync("Contrato_Fianza.pdf", pdfBuffer);

    // Codifica reglamento y contrato para enviar a Autentic
    const reglamentoBuffer = fs.readFileSync("contratos/REGLAMENTO DE FIANZA AFFI.pdf");
    const base64Reglamento = reglamentoBuffer.toString("base64");
    const base64PDF = pdfBuffer.toString("base64");

    return [base64PDF, base64Reglamento];
  } catch (error) {
    console.error("❌ Error generando contrato PDF:", error);
    throw error;
  }
}