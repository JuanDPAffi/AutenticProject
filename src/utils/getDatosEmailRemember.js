// src/utils/getDatosEmailRemember.js

// La función ahora acepta bodyText y asuntoRecibido
export default function getDatosEmailRemember(bodyText, asuntoRecibido) {
  try {
    console.log("📩 Procesando email recibido...");

    let asunto = null;
    let firmante = null;
    let processId = null;

    // Usamos el parámetro 'asuntoRecibido' después de limpiarlo con trim()
    const asuntoLimpio = asuntoRecibido ? asuntoRecibido.trim() : "";

    if (asuntoLimpio === "Proceso de firma completado - Autentic Sign") {
      asunto = "Proceso de firma completado - Autentic Sign";
    } else if (asuntoLimpio === "Notificación de firma en Autentic Sign") {
      asunto = "Notificación de firma en Autentic Sign";
    } else {
      // Si no coincide, lanzamos el error
      throw new Error("❌ Asunto no reconocido");
    }

    // El resto de tu lógica para extraer processId y firmante permanece igual,
    // ya que eso sí depende del bodyText (el HTML).

    const fecha = new Date().toLocaleDateString("es-CO");
    const modificado = new Date().toLocaleDateString("es-CO");

    const matchProceso = bodyText.match(/view-documents-signed\/([a-z0-9-]+)\//i);
    processId = matchProceso ? matchProceso[1] : null;
    if (!processId) throw new Error("❌ No se encontró processId");

    if (asunto === "Proceso de firma completado - Autentic Sign") {
      firmante = "Cesar Augusto Tezna Castaño";
    } else if (bodyText.includes("Lilian Paola Holguín")) {
      firmante = "Lilian Paola Holguín Orrego";
    } else if (bodyText.includes("Cesar Augusto Tezna")) {
      firmante = "Cesar Augusto Tezna Castaño";
    } else {
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