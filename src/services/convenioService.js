import Convenio from "../models/convenioModel.js";

/**
 * Genera un número de convenio único basado en el contrato proporcionado.
 * Si ya existe uno para ese contrato, **lo reusa** y lo retorna (NO lanza error).
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

  // 2) Buscar el último convenio creado y calcular el siguiente
  const ultimo = await Convenio.findOne().sort({ numero_convenio: -1 }).lean();

  let nuevoNumero = 5247; // Valor base por defecto (se mantiene tu base)
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
  const convenio = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  return convenio?.numero_convenio || null;
}
