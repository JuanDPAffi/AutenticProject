// services/firmaService.js
import { Gerente } from "../models/gerente.js";

export async function obtenerFirmantes(datos) {
  try {
    // Buscar gerentes necesarios
    const gerentes = await Gerente.find({ type: { $in: ["Comercial", "General"] } });

    const comercial = gerentes.find(g => g.type === "Comercial");
    const general = gerentes.find(g => g.type === "General");

    // Validar cliente
    let firmanteCliente;
    if (datos.tipo_persona.toLowerCase() === "juridica" || datos.tipo_persona.toLowerCase() === "jurídica") {
      firmanteCliente = {
        name: datos.nombre_representante_legal,
        lastName: "", // Puedes dividir si deseas
        identification: datos.cedula_representante_legal,
        email: datos.correo || datos.correo_representante_legal, // fallback
        phone: datos.numero_celular || datos.telefono_representante_legal || "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };

      if (!comercial || !general) {
        throw new Error("Faltan firmantes internos: comercial o gerencia.");
      }

      const firmanteComercial = {
        name: comercial.name,
        lastName: comercial.last_name,
        identification: comercial.cc.toString(),
        email: comercial.email,
        phone: "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };

      const firmanteGerente = {
        name: general.name,
        lastName: general.last_name,
        identification: general.cc.toString(),
        email: general.email,
        phone: "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };

      return [firmanteCliente, firmanteComercial, firmanteGerente];

    } else if (datos.tipo_persona.toLowerCase() === "natural") {
      firmanteCliente = {
        name: datos.nombre_persona_natural || datos.nombre_natural,
        lastName: "",
        identification: datos.cedula || datos.cedula_natural,
        email: datos.correo || datos.correo_natural,
        phone: datos.numero_celular || datos.telefono_natural || "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };

      if (!comercial) {
        throw new Error("Faltante firmante interno: comercial.");
      }

      const firmanteComercial = {
        name: comercial.name,
        lastName: comercial.last_name,
        identification: comercial.cc.toString(),
        email: comercial.email,
        phone: "",
        role: "SIGNER",
        authMethods: ["OTP"]
      };

      return [firmanteCliente, firmanteComercial];
    } else {
      throw new Error(`Tipo de persona inválido: ${datos.tipo_persona}`);
    }

  } catch (error) {
    console.error("❌ Error al obtener firmantes:", error.message);
    throw error;
  }
}
