// src/utils/determinarFirmantePendiente.js

export default function determinarFirmantePendiente(asunto, ccFirmante, convenio) {
  const a = (asunto || "").toLowerCase();
  const tieneConvenio = convenio === true; // Ahora es un booleano directo

  if (a.includes("completado")) return null;

  // 🔐 Cédulas oficiales
  const CC_FINANCIERA = "1115075655"; // Angelica
  const CC_COMERCIAL = "1112956229"; // Lilian
  const CC_GENERAL = "94492994";     // Cesar

  if (tieneConvenio) {
    // Flujo: Cliente → Financiera → Comercial → General
    if (ccFirmante === CC_GENERAL) return null; // Ya firmaron todos
    if (ccFirmante === CC_COMERCIAL) return "General"; // Lilian firmó, falta Cesar
    if (ccFirmante === CC_FINANCIERA) return "Comercial"; // Angelica firmó, falta Lilian
    return "Financiera"; // Cliente firmó, falta Angelica
  } else {
    // Flujo sin convenio: Cliente → Comercial → General
    if (ccFirmante === CC_GENERAL) return null; // Ya firmaron todos
    if (ccFirmante === CC_COMERCIAL) return "General"; // Lilian firmó, falta Cesar
    return "Comercial"; // Cliente firmó, falta Lilian
  }
}