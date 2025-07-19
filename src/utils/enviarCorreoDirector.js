// src\utils\enviarCorreoDirector.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function getToken() {
  try {
    const url = `https://login.microsoftonline.com/${process.env.TENANT_ID_AD}/oauth2/v2.0/token`;
    const response = await axios.post(
      url,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID_AD,
        client_secret: process.env.CLIENT_SECRET_AD,
        scope: process.env.GRAPH_SCOPE
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error obteniendo token:", error.response?.data || error.message);
    throw error;
  }
}

export default async function enviarCorreo(destinatarioEmail, htmlContent) {
  const token = await getToken();
  const sender = "comercial@affi.net"; // puedes cambiarlo si lo deseas

  const mailData = {
    message: {
      subject: "Firma de contrato completada por gerencia comercial",
      body: { contentType: "HTML", content: htmlContent },
      toRecipients: [{ emailAddress: { address: destinatarioEmail } }]
    },
    saveToSentItems: false
  };

  const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;
  await axios.post(urlMailSend, mailData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  console.log(`📤 Correo enviado a ${destinatarioEmail}`);
}