// services/firmaService.js
import { Gerente } from "../models/gerenteModel.js";
import dotenv from "dotenv";
dotenv.config(); // ✅ Esto carga las variables del archivo .env

function construirFirmante({ name, lastName = "", cc, email, phone = "" }) {
  return {
    name,
    lastName,
    identification: cc.toString(),
    email,
    phone,
    role: "SIGNER",
    authMethods: ["OTP"],
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
    if (!datos.nombre_representante_legal||!datos.apellido_representante_legal || !datos.cedula_representante_legal || !datos.correo) {
      throw new Error("Faltan datos del representante legal.");
    }

    cliente = construirFirmante({
      name: datos.nombre_representante_legal,
      lastName: datos.apellido_representante_legal,
      cc: datos.cedula_representante_legal,
      email: datos.correo,
      phone: datos.numero_celular || ""
    });
  } else if (tipo === "natural") {
    if (!datos.nombre_representante_legal||!datos.apellido_representante_legal || !datos.cedula_representante_legal || !datos.correo) {
      throw new Error("Faltan datos del cliente natural.");
    }

    cliente = construirFirmante({
      name: datos.nombre_representante_legal,
      lastName: datos.apellido_representante_legal,
      cc: datos.cedula_representante_legal,
      email: datos.correo,
      phone: datos.numero_celular || ""
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
      phone: ""
    }),
    construirFirmante({ 
      name: general.name,
      lastName: general.last_name,
      cc: general.cc,
      email: general.email,
      phone: ""
    })
  ];
}
