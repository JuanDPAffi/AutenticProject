// services/firmaService.js
import { Gerente } from "../models/gerente.js";

export async function obtenerFirmantes({ ciudad, tipo_persona }) {
  try {
    const gerente = await Gerente.findOne({ cc: 1 });

    const firmanteCliente = {
      name: "Juan Diego",
      lastName: "Pinilla Montoya",
      identification: "1006109780",
      email: "juandiegopm@yopmail.com",
      phone: "3146196336",
      role: "SIGNER",
      authenticationType: "EMAIL",
      signatureType: "GRAPHIC"
    };

    const firmanteGerente = {
      name: gerente.name,
      lastName: gerente.last_name,
      identification: gerente.cc.toString(),
      email: gerente.email,
      phone: "3000000000",
      role: "SIGNER",
      authenticationType: "EMAIL",
      signatureType: "GRAPHIC"
    };

    return [firmanteCliente, firmanteGerente];
  } catch (error) {
    console.error("❌ Error al obtener firmantes:", error);
    throw error;
  }
}