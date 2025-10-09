// src/services/contratoService.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import libre from "libreoffice-convert";
import { promisify } from "util";
import { generarNumeroConvenio } from "./convenioService.js";

const convertAsync = promisify(libre.convert);

export async function generarContratoPDF(datos) {
  const carpetaContratos = path.resolve("src/contratos");
  if (!fs.existsSync(carpetaContratos)) {
    fs.mkdirSync(carpetaContratos, { recursive: true });
  }

  const rutaJSON = "/tmp/datosTemp.json";
  fs.writeFileSync(rutaJSON, JSON.stringify(datos, null, 2));
  console.log("💾 Datos guardados en /tmp/datosTemp.json");

  const tipo = datos.tipo_persona?.toLowerCase();
  if (tipo === "natural") {
    execSync("node src/contratos/contratoNatural.js", { stdio: "inherit" });
  } else if (tipo === "juridica" || tipo === "jurídica") {
    execSync("node src/contratos/contratoJuridico.js", { stdio: "inherit" });
  } else {
    throw new Error("Tipo de persona no reconocido.");
  }

  const docxPath = path.resolve("src/contratos/Contrato_Fianza.docx");
  const docxBuffer = fs.readFileSync(docxPath);

  const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
  const pdfPath = path.resolve("src/contratos/Contrato_Fianza.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log("📄 Contrato convertido a PDF");

  return pdfBuffer.toString("base64");
}

export async function generarConvenioPDF(datos) {
  const carpetaContratos = path.resolve("src/contratos");
  if (!fs.existsSync(carpetaContratos)) {
    fs.mkdirSync(carpetaContratos, { recursive: true });
  }

  // ✅ Política:
  // 1) Si YA viene numero_convenio_digital en el JSON, lo respetamos (NO generamos ni insertamos).
  // 2) Si NO viene, generamos y guardamos en BD.
  if (!datos.numero_convenio_digital) {
    const numeroConvenio = await generarNumeroConvenio(datos.numero_de_contrato);
    datos.numero_convenio_digital = numeroConvenio;
  } else {
    console.log(
      `ℹ️ Usando numero_convenio_digital recibido: ${datos.numero_convenio_digital} (no se genera ni inserta en BD)`
    );
  }

  const rutaJSON = "/tmp/datosTemp.json";
  fs.writeFileSync(rutaJSON, JSON.stringify(datos, null, 2));
  console.log("💾 Datos para convenio guardados en /tmp/datosTemp.json");

  const tipo = datos.tipo_persona?.toLowerCase();
  if (tipo === "natural") {
    execSync("node src/contratos/convenioNatural.js", { stdio: "inherit" });
  } else if (tipo === "juridica" || tipo === "jurídica") {
    execSync("node src/contratos/convenioJuridico.js", { stdio: "inherit" });
  } else {
    throw new Error("Tipo de persona no reconocido para convenio.");
  }

  const docxPath = path.resolve("src/contratos/CONVENIO_FIRMA_DIGITAL.docx");
  const docxBuffer = fs.readFileSync(docxPath);

  const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
  const pdfPath = path.resolve("src/contratos/Convenio_Fianza.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log("📄 Convenio convertido a PDF");

  return pdfBuffer.toString("base64");
}
