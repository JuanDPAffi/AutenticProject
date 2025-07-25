// src/services/convenioService.js

import Convenio from "../models/convenioModel.js";

export async function generarNumeroConvenio(numeroContrato) {
  // Buscar el último número de convenio creado
  const ultimo = await Convenio.findOne()
    .sort({ numero_convenio: -1 })
    .lean();

  let nuevoNumero = 1000;

  if (ultimo) {
    const partes = ultimo.numero_convenio.split("-");
    const actual = parseInt(partes[1], 10);
    nuevoNumero = actual + 1;
  }

  const numeroConvenio = `FD-${nuevoNumero}`;

  // Guardar en la base de datos
  await Convenio.create({
    numero_contrato: numeroContrato,
    numero_convenio: numeroConvenio,
    fecha_generacion: new Date()
  });

  return numeroConvenio;
}

export async function obtenerNumeroConvenioPorContrato(numeroContrato) {
  const convenio = await Convenio.findOne({ numero_contrato: numeroContrato }).lean();
  return convenio?.numero_convenio || null;
}