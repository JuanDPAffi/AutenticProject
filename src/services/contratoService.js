// services/contratoService.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import libre from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(libre.convert);

export async function generarContratoPDF(datos) {
  const carpetaContratos = path.resolve("src/contratos");
  if (!fs.existsSync(carpetaContratos)) {
    fs.mkdirSync(carpetaContratos, { recursive: true });
  }

  const rutaJSON = path.join(carpetaContratos, "datosTemp.json");
  fs.writeFileSync(rutaJSON, JSON.stringify(datos, null, 2));
  console.log("💾 Datos guardados en datosTemp.json");

  // Luego ejecutas el contrato
  const tipo = datos.tipo_persona?.toLowerCase();
  if (tipo === "natural") {
    execSync("node src/contratos/contratoNatural.js", { stdio: "inherit" });
  } else if (tipo === "juridica" || tipo === "jurídica") {
    execSync("node src/contratos/contratoJuridico.js", { stdio: "inherit" });
  } else {
    throw new Error("Tipo de persona no reconocido.");
  }

  // Leer DOCX generado
  const docxPath = path.resolve("Contrato_Fianza.docx");
  const docxBuffer = fs.readFileSync(docxPath);

  // Convertir a PDF
  const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
  const pdfPath = path.resolve("Contrato_Fianza.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log("📄 Contrato convertido a PDF");

  // Retornar como base64
  return pdfBuffer.toString("base64");
}
