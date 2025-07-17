// src/utils/getDatosEmailRemember.js

export default function getDatosEmailRemember(bodyText) {
  try {
    console.log("📩 Procesando email recibido...");

    let asunto = null;
    let firmante = null;
    let processId = null;

    // Detectar asunto
    if (bodyText.includes("Proceso de firma completado - Autentic Sign")) {
      asunto = "Proceso de firma completado - Autentic Sign";
    } else if (bodyText.includes("Notificación de firma en Autentic Sign")) {
      asunto = "Notificación de firma en Autentic Sign";
    } else {
      throw new Error("❌ Asunto no reconocido");
    }

    const fecha = new Date().toLocaleDateString("es-CO");
    const modificado = new Date().toLocaleDateString("es-CO");

    // Extraer processId del enlace
    const matchProceso = bodyText.match(/view-documents-signed\/([a-z0-9-]+)\//i);
    processId = matchProceso ? matchProceso[1] : null;
    if (!processId) throw new Error("❌ No se encontró processId");

    // Determinar firmante
    if (asunto === "Proceso de firma completado - Autentic Sign") {
      firmante = "Cesar Augusto Tezna Castaño";

    } else if (bodyText.includes("Lilian Paola Holguín")) {
      firmante = "Lilian Paola Holguín Orrego";

    } else if (bodyText.includes("Cesar Augusto Tezna")) {
      firmante = "Cesar Augusto Tezna Castaño"; // por si acaso llega antes del completado

    } else {
      // Detectar firmante del <label> cuando es el cliente
      const matchFirmante = bodyText.match(/<label[^>]*>(.*?)<\/label>\s*firmó los documentos/i);
      firmante = matchFirmante ? matchFirmante[1].trim().replace(/\s+/g, " ") : null;

      if (!firmante) throw new Error("❌ No se encontró firmante en el correo");
    }

    return { processId, asunto, fecha, firmante, modificado };

  } catch (error) {
    console.error("💥 Error extrayendo datos del correo:", error.message);
    throw error;
  }
}
