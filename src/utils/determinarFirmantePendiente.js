// src/utils/determinarFirmantePendiente.js

export default function determinarFirmantePendiente(asunto, firmante) {
  const f = firmante.toLowerCase();
  const a = asunto.toLowerCase();

  if (a.includes("completado")) return null;
  if (f.includes("lilian")) return "Cesar Augusto Tezna Castaño";
  if (f.includes("cesar")) return null;
  return "Lilian Paola Holguín Orrego"; // asumimos que firmó el cliente
}
