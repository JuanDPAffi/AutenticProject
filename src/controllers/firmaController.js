export async function ejecutarProcesoFirma(idVinculacion) {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB,
  });

  const tipoPersona = await obtenerTipoPersona(idVinculacion);
  console.log("🧾 Tipo de persona desde HubSpot:", tipoPersona);

  generarContrato(tipoPersona);

  console.log("📄 Convirtiendo DOCX a PDF...");
  const pdfBuffer = await convertirDocxAPdf("Contrato_Fianza.docx", "Contrato_Fianza.pdf");

  const reglamentoBuffer = fs.readFileSync("REGLAMENTO DE FIANZA AFFI 8.pdf");
  const base64Reglamento = reglamentoBuffer.toString("base64");
  const base64PDF = pdfBuffer.toString("base64");

  const firmanteCliente = {
    name: "Juan Diego",
    lastName: "Pinilla Montoya",
    identification: "1006109780",
    email: "juandiegopm@yopmail.com",
    phone: "3146196336",
    role: "SIGNER",
    authMethods: ["OTP"]
  };
  const firmantesMongo = await obtenerFirmantesDesdeMongo();
  const todosFirmantes = [firmanteCliente, ...firmantesMongo];

  const token = await obtenerToken();

  console.log("📤 Enviando contrato a Autentic...");
  await enviarParaFirma(base64PDF, base64Reglamento, token, todosFirmantes);

  await mongoose.disconnect();
}
