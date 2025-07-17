export default function getDatosEmailRemember(bodyText) {
  try {
    console.log("📩 Procesando email recibido...");

    let asunto = null;
    let firmante = null;
    let processId = null;

    if (bodyText.includes("Proceso de firma completado - Autentic Sign")) {
      asunto = "Proceso de firma completado - Autentic Sign";
    } else if (bodyText.includes("Notificación de firma en Autentic Sign")) {
      asunto = "Notificación de firma en Autentic Sign";
    } else {
      throw new Error("❌ Asunto no reconocido");
    }

    const fecha = new Date().toLocaleDateString("es-CO");
    const modificado = new Date().toLocaleDateString("es-CO");

    const matchProceso = bodyText.match(/view-documents-signed\/([a-z0-9-]+)\//i);
    processId = matchProceso ? matchProceso[1] : null;
    if (!processId) throw new Error("❌ No se encontró processId");

    if (asunto === "Notificación de firma en Autentic Sign") {
      const matchFirmante = bodyText.match(/([\wÁÉÍÓÚÑáéíóúñ\s.]+)\s*firmó los documentos/i);
      firmante = matchFirmante ? matchFirmante[1].trim() : null;
      if (!firmante) throw new Error("❌ No se encontró firmante");
    } else {
      firmante = "Firma completada";
    }

    return { processId, asunto, fecha, firmante, modificado };

  } catch (error) {
    console.error("💥 Error extrayendo datos del correo:", error.message);
    throw error;
  }
}
