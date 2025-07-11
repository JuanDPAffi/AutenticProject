// services/firmaService.js
import { Gerente } from "../models/gerente.js";

export async function obtenerFirmantes(datos) {
  try {
    const tipoGerente = datos.tipo_persona === "juridica" ? "General" : "Comercial";
    const gerente = await Gerente.findOne({ type: tipoGerente });

    if (!gerente) {
      throw new Error(`No se encontró un gerente para tipo: ${tipoGerente}`);
    }

    // Asignar firmante cliente según tipo de persona
    let firmanteCliente;

    if (datos.tipo_persona === "juridica") {
      firmanteCliente = {
        name: datos.nombre_representante_legal,
        lastName: "", // Puedes separar nombres si es necesario
        identification: datos.cedula_representante_legal,
        email: datos.correo_representante_legal,
        phone: datos.telefono_representante_legal || "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };
    } else {
      firmanteCliente = {
        name: datos.nombre_natural,
        lastName: "",
        identification: datos.cedula_natural,
        email: datos.correo_natural,
        phone: datos.telefono_natural || "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };
    }

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
