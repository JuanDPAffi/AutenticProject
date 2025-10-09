import Convenio from "../models/convenioModel.js";

/**
 * Genera un número de convenio único basado en el contrato proporcionado.
 * - Si ya existe uno para ese contrato, lo reusa y lo retorna (NO lanza error).
 * - Si no existe, busca el último (orden lexicográfico por ahora), suma 1 y crea el nuevo.
 */
export async function generarNumeroConvenio(numeroContrato, reintento = 0) {
  if (!numeroContrato) throw new Error("numeroContrato es requerido");
  if (reintento >= 5) {
    throw new Error("❌ No se pudo generar un número de convenio único tras varios intentos");
  }

  // 1) Reusar si ya existe para ese contrato
  const existente = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  if (existente?.numero_convenio) {
    console.warn(`♻️ Reusando convenio existente para ${numeroContrato}: ${existente.numero_convenio}`);
    return existente.numero_convenio;
  }

  // 2) Buscar el último convenio creado y calcular el siguiente (orden lexicográfico)
  const ultimo = await Convenio.findOne().sort({ numero_convenio: -1 }).lean();

  let nuevoNumero = 5247; // base por defecto (se mantiene tu base)
  if (ultimo?.numero_convenio?.startsWith?.("FD")) {
    const actual = parseInt(ultimo.numero_convenio.replace("FD", ""), 10);
    if (!Number.isNaN(actual)) {
      nuevoNumero = Math.max(nuevoNumero, actual + 1);
    }
  }

  const numeroConvenio = `FD${nuevoNumero}`;

  // 3) Intentar guardar el nuevo convenio (manejo de colisiones por índice único)
  try {
    await Convenio.create({
      numero_contrato: numeroContrato,
      numero_convenio: numeroConvenio,
      fecha_generacion: new Date()
    });

    console.log(`✅ Convenio generado para el contrato ${numeroContrato}: ${numeroConvenio}`);
    return numeroConvenio;
  } catch (error) {
    if (error.code === 11000) {
      console.warn(`🔁 Duplicado detectado al generar convenio para ${numeroContrato}, reintentando...`);
      return await generarNumeroConvenio(numeroContrato, reintento + 1);
    }

    console.error(`❌ Error al generar convenio para el contrato ${numeroContrato}:`, error);
    throw error;
  }
}

/**
 * Devuelve el número de convenio asociado a un contrato (si existe).
 */
export async function obtenerNumeroConvenioPorContrato(numeroContrato) {
  if (!numeroContrato) throw new Error("numeroContrato es requerido");
  const convenio = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  return convenio?.numero_convenio || null;
}

/**
 * Asegura que exista en BD el par { numero_contrato, numero_convenio }.
 * Útil cuando el numero_convenio viene en el JSON y quieres persistirlo.
 * - Si ya existe para el contrato, devuelve el numero_convenio (no hace nada).
 * - Si no existe, crea el registro con el consecutivo recibido.
 * - Si ese consecutivo ya está usado por OTRO contrato, lanza error.
 */
export async function asegurarConvenioEnBD(numeroContrato, numeroConvenio) {
  if (!numeroContrato || !numeroConvenio) {
    throw new Error("numeroContrato y numeroConvenio son requeridos");
  }

  const numeroLimpio = String(numeroConvenio).trim().toUpperCase();

  // ¿Ya existe para el contrato?
  const existenteContrato = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  if (existenteContrato?.numero_convenio) {
    return existenteContrato.numero_convenio; // nada que hacer
  }

  // ¿Ese consecutivo ya lo usa otro contrato?
  const existenteNumero = await Convenio.findOne({ numero_convenio: numeroLimpio }).lean();
  if (existenteNumero && existenteNumero.numero_contrato !== numeroContrato) {
    throw new Error(
      `El consecutivo ${numeroLimpio} ya está asociado al contrato ${existenteNumero.numero_contrato}`
    );
  }

  // Crear registro
  await Convenio.create({
    numero_contrato: numeroContrato,
    numero_convenio: numeroLimpio,
    fecha_generacion: new Date()
  });

  console.log(`✅ Convenio asegurado en BD para el contrato ${numeroContrato}: ${numeroLimpio}`);
  return numeroLimpio;
}
