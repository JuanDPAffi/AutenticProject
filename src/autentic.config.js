// src/autentic.config.js
export const autenticConfig = {
  authUrl: process.env.AUTH_URL,
  signingUrl: process.env.SIGNING_URL,
  audience: process.env.AUDIENCE,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  enterpriseId: process.env.ENTERPRISE_ID,
  senderEmail: process.env.SENDER_EMAIL,
  senderIdentification: process.env.SENDER_IDENTIFICATION
};
