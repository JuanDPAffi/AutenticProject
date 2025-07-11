// services/firmaService.js
import { Gerente } from "../models/gerente.js";

function construirFirmante({ name, lastName = "", cc, email, phone = "", roleTemplate = "SIGNER" }) {
  return {
    name,
    lastName,
    identification: cc.toString(),
    email,
    phone,
    role: "SIGNER",
    authMethods: ["OTP"],
    roleTemplate
  };
}

export async function obtenerFirmantes(datos) {
  try {
    const tipo = (datos.tipo_persona || "").toLowerCase();

    const gerentes = await Gerente.find({ type: { $in: ["Comercial", "General"] } });

    const comercial = gerentes.find(g => g.type === "Comercial");
    const general = gerentes.find(g => g.type === "General");

    let cliente = null;

    if (tipo === "juridica") {
      if (!datos.nombre_representante_legal || !datos.cedula_representante_legal || !datos.correo) {
        throw new Error("Faltan datos del representante legal.");
      }

      cliente = construirFirmante({
        name: datos.nombre_representante_legal,
        lastName: "",
        cc: datos.cedula_representante_legal,
        email: datos.correo,
        phone: datos.numero_celular || "",
        roleTemplate: "cliente"
      });

      if (!comercial || !general) {
        throw new Error("Faltan firmantes internos (comercial o gerencia).");
      }

      return [
        cliente,
        construirFirmante({ ...comercial.toObject(), roleTemplate: "comercial" }),
        construirFirmante({ ...general.toObject(), roleTemplate: "gerencia" })
      ];
    }

    if (tipo === "natural") {
      if (!datos.nombre_persona_natural || !datos.cedula || !datos.correo) {
        throw new Error("Faltan datos del cliente persona natural.");
      }

      cliente = construirFirmante({
        name: datos.nombre_persona_natural,
        lastName: "",
        cc: datos.cedula,
        email: datos.correo,
        phone: datos.numero_celular || "",
        roleTemplate: "cliente"
      });

      if (!comercial) {
        throw new Error("Falta firmante comercial.");
      }

      return [
        cliente,
        construirFirmante({ ...comercial.toObject(), roleTemplate: "comercial" })
      ];
    }

    throw new Error(`Tipo de persona no válido: ${datos.tipo_persona}`);
  } catch (error) {
    console.error("❌ Error al construir firmantes:", error.message);
    throw error;
  }
}
