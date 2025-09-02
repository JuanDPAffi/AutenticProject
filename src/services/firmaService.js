// src/services/firmaService.js

import { Gerente } from "../models/gerenteModel.js";
import dotenv from "dotenv";
dotenv.config();

function construirFirmante({ name, lastName = "", cc, email, phone = "" }) {
  return {
    name,
    lastName,
    identification: cc.toString(),
    email,
    phone,
    role: "SIGNER",
    authMethods: ["OTP"]
  };
}

export async function obtenerFirmantes(datos, incluirGerenteFinanciera = false) {
  const tipo = (datos.tipo_persona || "").toLowerCase();

  // Traer gerentes necesarios
  const gerentes = await Gerente.find({
    type: incluirGerenteFinanciera
      ? { $in: ["Financiera", "Comercial", "General"] }
      : { $in: ["Comercial", "General"] }
  });

  const financiera = gerentes.find(g => g.type === "Financiera");
  const comercial = gerentes.find(g => g.type === "Comercial");
  const general = gerentes.find(g => g.type === "General");

  if (!comercial || !general) {
    throw new Error("No se encontraron ambos gerentes (Comercial y General) en MongoDB.");
  }

  if (incluirGerenteFinanciera && !financiera) {
    throw new Error("No se encontró la Gerente Financiera en MongoDB.");
  }

  // Cliente (natural o jurídica)
  let cliente = null;

  if (["juridica", "jurídica", "natural"].includes(tipo)) {
    if (
      !datos.nombre_representante_legal ||
      !datos.apellido_representante_legal ||
      !datos.cedula_representante_legal ||
      !datos.correo
    ) {
      throw new Error("Faltan datos del cliente.");
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

  const firmantes = incluirGerenteFinanciera
  ? [
      cliente,
      construirFirmante({
        name: financiera.name,
        lastName: financiera.last_name,
        cc: financiera.cc,
        email: financiera.email
      }),
      construirFirmante({
        name: comercial.name,
        lastName: comercial.last_name,
        cc: comercial.cc,
        email: comercial.email
      }),
      construirFirmante({
        name: general.name,
        lastName: general.last_name,
        cc: general.cc,
        email: general.email
      })
    ]
  : [
      cliente,
      construirFirmante({
        name: comercial.name,
        lastName: comercial.last_name,
        cc: comercial.cc,
        email: comercial.email
      }),
      construirFirmante({
        name: general.name,
        lastName: general.last_name,
        cc: general.cc,
        email: general.email
      })
    ];

  return firmantes;
}
