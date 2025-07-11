// services/firmaService.js
import { Gerente } from "../models/gerente.js";

export async function obtenerFirmantes({ ciudad, tipo_persona }) {
  try {
    const tipoGerente = tipo_persona === "juridica" ? "General" : "Comercial";
    const gerente = await Gerente.findOne({ type: tipoGerente });

    if (!gerente) {
      throw new Error(`No se encontró un gerente para tipo: ${tipoGerente}`);
    }

    const firmanteCliente = {
      name: "Juan Diego",
      lastName: "Pinilla Montoya",
      identification: "1006109780",
      email: "juandiegopm@yopmail.com",
      phone: "3146196336",
      role: "SIGNER",
      authMethods: ["OTP"]
    };

    const firmanteGerente = {
      name: gerente.name,
      lastName: gerente.last_name,
      identification: gerente.cc.toString(),
      email: gerente.email,
      phone: "",
      role: "SIGNER",
      authMethods: ["OTP"]
    };

    return [firmanteCliente, firmanteGerente];
  } catch (error) {
    console.error("❌ Error al obtener firmantes:", error);
    throw error;
  }
}
