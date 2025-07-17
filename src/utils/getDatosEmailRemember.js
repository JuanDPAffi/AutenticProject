// src/utils/getDatosEmailRemember.js

export default function getDatosEmailRemember({ bodyHtml, asunto }) {
  try {
    console.log("📩 Procesando email recibido...");

    let firmante = null;
    let processId = null;

    const fecha = new Date().toLocaleDateString("es-CO");
    const modificado = new Date().toLocaleDateString("es-CO");

    // Validar asunto
    if (
      !asunto.includes("Proceso de firma completado - Autentic Sign") &&
      !asunto.includes("Notificación de firma en Autentic Sign")
    ) {
      throw new Error("❌ Asunto no reconocido");
    }

    // Extraer processId desde el enlace del botón
    const matchProceso = bodyHtml.match(/view-documents-signed\/([a-z0-9-]+)\//i);
    processId = matchProceso ? matchProceso[1] : null;
    if (!processId) throw new Error("❌ No se encontró processId en el HTML");

    // Determinar firmante según el contenido del correo
    if (asunto.includes("Proceso de firma completado")) {
      firmante = "Cesar Augusto Tezna Castaño";
    } else if (bodyHtml.includes("Lilian Paola Holguín")) {
      firmante = "Lilian Paola Holguín Orrego";
    } else if (bodyHtml.includes("Cesar Augusto Tezna")) {
      firmante = "Cesar Augusto Tezna Castaño";
    } else {
      // Buscar firmante en la etiqueta <label> (cliente)
      const matchFirmante = bodyHtml.match(/<label[^>]*>(.*?)<\/label>\s*firmó los documentos/i);
      firmante = matchFirmante ? matchFirmante[1].trim().replace(/\s+/g, " ") : null;

      if (!firmante) throw new Error("❌ No se encontró firmante en el HTML");
    }

    return { processId, asunto: asunto.trim(), fecha, firmante, modificado };

  } catch (error) {
    console.error("💥 Error extrayendo datos del correo:", error.message);
    throw error;
  }
}
