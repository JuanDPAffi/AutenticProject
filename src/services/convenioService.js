import Convenio from "../models/convenioModel.js";

/**
 * Genera un número de convenio único basado en el contrato proporcionado.
 * Si ya existe uno para ese contrato, lanza un error.
 */
export async function generarNumeroConvenio(numeroContrato, reintento = 0) {
  if (reintento >= 5) {
    throw new Error("❌ No se pudo generar un número de convenio único tras varios intentos");
  }

  // 1. Verificar si ya existe un convenio para ese contrato
  const existente = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  if (existente) {
    console.warn(`⚠️ Ya existe un convenio para el contrato ${numeroContrato}: ${existente.numero_convenio}`);
    throw new Error(`Ya existe un convenio generado para este contrato: ${existente.numero_convenio}`);
  }

  // 2. Buscar el último convenio creado
  const ultimo = await Convenio.findOne()
    .sort({ numero_convenio: -1 })
    .lean();

  let nuevoNumero = 5247; // Valor base por defecto
  if (ultimo) {
    const actual = parseInt(ultimo.numero_convenio.replace("FD", ""), 10);
    nuevoNumero = actual + 1;
  }

  const numeroConvenio = `FD${nuevoNumero}`;

  // 3. Intentar guardar el nuevo convenio
  try {
    const creado = await Convenio.create({
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
