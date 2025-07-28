// src/services/convenioService.js

import Convenio from "../models/convenioModel.js";

export async function generarNumeroConvenio(numeroContrato, reintento = 0) {
  // 🚫 Máximo 5 intentos para evitar bucles infinitos
  if (reintento >= 5) {
    throw new Error("No se pudo generar un número de convenio único tras varios intentos");
  }

  // 1. Verificar si ya existe convenio para este contrato
  const existente = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  if (existente) return existente.numero_convenio;

  // 2. Buscar el último convenio registrado
  const ultimo = await Convenio.findOne()
    .sort({ numero_convenio: -1 })
    .lean();

  // 3. Calcular el nuevo número
  let nuevoNumero = 5247;
  if (ultimo) {
    const actual = parseInt(ultimo.numero_convenio.replace("FD", ""), 10);
    nuevoNumero = actual + 1;
  }

  const numeroConvenio = `FD${nuevoNumero}`;

  // 4. Intentar guardar el nuevo convenio
  try {
    await Convenio.create({
      numero_contrato: numeroContrato,
      numero_convenio: numeroConvenio,
      fecha_generacion: new Date()
    });

    return numeroConvenio;
  } catch (error) {
    // 5. Si fue por clave duplicada (otro proceso lo generó), reintentar
    if (error.code === 11000) {
      return await generarNumeroConvenio(numeroContrato, reintento + 1);
    }

    // Otro error inesperado
    throw error;
  }
}

export async function obtenerNumeroConvenioPorContrato(numeroContrato) {
  const convenio = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  return convenio?.numero_convenio || null;
}
