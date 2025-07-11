// services/firmaService.js
import { Gerente } from "../models/gerente.js";

function construirFirmante({ name, lastName = "", cc, email, phone = "", roleTemplate = "cliente" }) {
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
  const tipo = (datos.tipo_persona || "").toLowerCase();

  const gerentes = await Gerente.find({ type: { $in: ["Comercial", "General"] } });

  const comercial = gerentes.find(g => g.type === "Comercial");
  const general = gerentes.find(g => g.type === "General");

  if (!comercial || !general) {
    throw new Error("No se encontraron ambos gerentes (comercial y general) en MongoDB.");
  }

  let cliente = null;

  if (tipo === "juridica" || tipo === "jurídica") {
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
  } else if (tipo === "natural") {
    if (!datos.nombre_persona_natural || !datos.cedula || !datos.correo) {
      throw new Error("Faltan datos del cliente natural.");
    }

    cliente = construirFirmante({
      name: datos.nombre_persona_natural,
      lastName: "",
      cc: datos.cedula,
      email: datos.correo,
      phone: datos.numero_celular || "",
      roleTemplate: "cliente"
    });
  } else {
    throw new Error(`Tipo de persona inválido: ${datos.tipo_persona}`);
  }

  return [
    cliente,
    construirFirmante({ 
      name: comercial.name,
      lastName: comercial.last_name,
      cc: comercial.cc,
      email: comercial.email,
      phone: "", // puedes incluir si lo usas
      roleTemplate: "comercial"
    }),
    construirFirmante({ 
      name: general.name,
      lastName: general.last_name,
      cc: general.cc,
      email: general.email,
      phone: "",
      roleTemplate: "gerencia"
    })
  ];
}
