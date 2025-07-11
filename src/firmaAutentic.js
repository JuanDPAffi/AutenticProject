import dotenv from "dotenv";
dotenv.config();

import { execSync } from "child_process";
import fs from "fs";
import libre from "libreoffice-convert";
import { promisify } from "util";
import axios from "axios";
import mongoose from "mongoose";
import { Gerente } from "./models/gerente.js";

// Importar configuración de Autentic
const {
  AUTH_URL: authUrl,
  SIGNING_URL: signingUrl,
  AUDIENCE: audience,
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  ENTERPRISE_ID: enterpriseId,
  SENDER_EMAIL: senderEmail,
  SENDER_IDENTIFICATION: senderIdentification
} = process.env;

const convertAsync = promisify(libre.convert);

// ✅ Conectar a MongoDB
await mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB
});

// ✅ Generar contrato DOCX
function generarContrato() {
  console.log("📝 Generando contrato DOCX...");
  execSync("node src/contratos/contratoJuridico.js", { stdio: "inherit" });

  if (!fs.existsSync("src/contratos/Contrato_Fianza.docx")) {
    throw new Error("❌ El archivo Contrato_Fianza.docx no fue generado correctamente.");
  }
}

// ✅ Convertir DOCX a PDF
async function convertirDocxAPdf(docxPath, pdfPath) {
  const docxBuffer = fs.readFileSync(docxPath);
  const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
  fs.writeFileSync(pdfPath, pdfBuffer);
  return pdfBuffer;
}

// ✅ Obtener token
async function obtenerToken() {
  const { data } = await axios.post(authUrl, {
    audience,
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  return data.access_token;
}

function obtenerFechaExpiracion(dias = 7) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
}

// ✅ Obtener firmantes desde Mongo ordenados: Comercial → General
async function obtenerFirmantesDesdeMongo() {
  const gerentes = await Gerente.find({ type: { $in: ["Comercial", "General"] } });

  const orden = ["Comercial", "General"];
  const ordenados = orden.flatMap(tipo =>
    gerentes.filter(g => g.type === tipo)
  );

  return ordenados.map(g => ({
    name: g.name,
    lastName: g.last_name,
    identification: g.cc.toString(),
    email: g.email,
    phone: "",
    role: "SIGNER",
    authMethods: ["OTP"]
  }));
}

// ✅ Enviar documentos a Autentic
async function enviarParaFirma(base64Reglamento, base64PDF, token, firmantes) {
  const payload = {
    sendCompletionNotification: true,
    emailForNotification: senderEmail,
    processes: [
      {
        enterpriseId,
        senderEmail,
        senderIdentification,
        signers: firmantes,
        documents: [
          { content: base64Reglamento, fileName: "REGLAMENTO DE FIANZA AFFI.pdf", type: "ATTACHMENT" },
          { content: base64PDF, fileName: "Contrato_Fianza.pdf" }
        ],
        subject: "Firma del Contrato de Fianza",
        message: "Por favor firme el contrato digitalmente.",
        order: true,
        expirationDate: obtenerFechaExpiracion(7),
        sendEmail: true
      }
    ]
  };

  // Mostrar orden de firmantes
  console.log("📬 Orden de firmantes:");
  firmantes.forEach((f, i) =>
    console.log(`${i + 1}. ${f.name} ${f.lastName} - ${f.email}`)
  );

  const { data } = await axios.post(signingUrl, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  console.log("✅ Proceso de firma creado:");
  console.log(data);
}

// ✅ Flujo principal
(async () => {
  try {
    generarContrato();

    console.log("📄 Convirtiendo DOCX a PDF...");
    const pdfBuffer = await convertirDocxAPdf("src/contratos/Contrato_Fianza.docx", "src/contratos/Contrato_Fianza.pdf");

    const reglamentoBuffer = fs.readFileSync("src/contratos/REGLAMENTO DE FIANZA AFFI.pdf");
    const base64Reglamento = reglamentoBuffer.toString("base64");
    const base64PDF = pdfBuffer.toString("base64");

    const firmanteCliente = {
      name: "Juan Diego",
      lastName: "Pinilla Montoya",
      identification: "1006109780",
      email: "pinillamontoyajuandiego@gmail.com",
      phone: "3146196336",
      role: "SIGNER",
      authMethods: ["OTP"]
    };

    const firmantesMongo = await obtenerFirmantesDesdeMongo();
    const todosFirmantes = [firmanteCliente, ...firmantesMongo];

    console.log("🔐 Solicitando token...");
    const token = await obtenerToken();

    console.log("📤 Enviando contrato a Autentic...");
    await enviarParaFirma(base64Reglamento, base64PDF, token, todosFirmantes);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    process.exit(1);
  }
})();
