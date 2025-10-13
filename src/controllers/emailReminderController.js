// src/controllers/emailReminderController.js

import Proceso from "../models/procesoModel.js";
import Director from "../models/directorModel.js";
import { Gerente } from "../models/gerenteModel.js";
import enviarCorreoDirector from "../utils/enviarCorreoDirector.js";
import emailDirectorTemplate from "../templates/templateEmailDirectores.js";

import enviarCorreoRecordatorio from "../utils/enviarCorreoRecordatorio.js";
import determinarFirmantePendiente from "../utils/determinarFirmantePendiente.js";

// 🕐 Función helper para delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ⚙️ CONFIGURACIÓN: Enviar correo a directores cuando es convenio
const ENVIAR_CORREO_DIRECTOR_CONVENIOS = true; // ✅ Cambia a true para activar

export const gestionarRecordatorioDesdeHubspot = async (req, res) => {
  try {
    console.log(`\n========================================`);
    console.log(`📥 INICIO - Datos recibidos desde HubSpot:`);
    console.log(JSON.stringify(req.body, null, 2));
    console.log(`========================================\n`);

    const { zona, processId, numContrato, nombreCliente, tipo_contrato, endpointConvenio, numConvenio } = req.body;
    
    // 🔍 Determinar si es convenio de firma digital
    const esConvenio = endpointConvenio?.trim().toLowerCase() === "si";
    console.log(`📋 Tipo de documento: ${esConvenio ? "Convenio de firma digital" : "Contrato de fianza"}`);

    // 📝 Determinar qué número usar según el tipo de documento
    const numeroDocumento = esConvenio && numConvenio ? numConvenio : numContrato;
    console.log(`📄 Número de documento a usar: ${numeroDocumento} ${esConvenio ? "(convenio)" : "(contrato)"}`);

    if (!zona || !processId || !numeroDocumento || !nombreCliente || !tipo_contrato) {
      return res.status(400).json({ error: "Faltan datos en la solicitud" });
    }

    const proceso = await Proceso.findOne({ processId });
    if (!proceso) {
      return res.status(404).json({ error: "No se encontró el proceso con ese ID" });
    }

    console.log(`📄 Estado actual del proceso en BD:`, {
      processId: proceso.processId,
      firmante: proceso.firmante,
      asunto: proceso.asunto,
      correoDirector: proceso.correoDirector,
      zona: proceso.zona,
      convenio: proceso.convenio
    });

    const { firmante, asunto, correoDirector } = proceso;
    
    // 🔄 Determinar si hay convenio basado en el POST request
    const convenioTexto = (req.body.convenio_firma_digital || "").toLowerCase().trim();
    const tieneConvenio = ["sí", "si", "Sí", "Si"].includes(req.body.convenio_firma_digital?.trim()) || convenioTexto === "si" || convenioTexto === "sí";
    
    // 💾 Guardar el campo convenio como booleano
    proceso.convenio = tieneConvenio;
    await proceso.save();
    
    console.log(`✅ Campo convenio actualizado a: ${tieneConvenio} (basado en: "${req.body.convenio_firma_digital}")`);

    // 🔍 Buscar si el firmante actual es un gerente para obtener su cédula
    let cedulaFirmante = null;
    
    if (firmante) {
      const gerente = await Gerente.findOne({
        $or: [
          { $expr: { $eq: [{ $concat: ["$name", " ", "$last_name"] }, firmante.trim()] } },
          { $expr: { $eq: [{ $concat: ["$last_name", " ", "$name"] }, firmante.trim()] } }
        ]
      });
      
      if (gerente) {
        cedulaFirmante = gerente.cc?.toString();
        console.log(`🔍 Gerente encontrado: ${gerente.name} ${gerente.last_name} - CC: ${cedulaFirmante}`);
      } else {
        console.log(`⚠️ Firmante "${firmante}" no es un gerente registrado (probablemente cliente)`);
      }
    }

    // 📌 1️⃣ Enviar recordatorio a gerencias si falta alguien por firmar
    const firmantePendiente = determinarFirmantePendiente(
      asunto, 
      cedulaFirmante, 
      proceso.convenio
    );

    console.log(`🔍 Debug - Firmante: ${firmante}, Cédula: ${cedulaFirmante}, Convenio: ${proceso.convenio}, Pendiente: ${firmantePendiente}`);

    if (firmantePendiente) {
      await enviarCorreoRecordatorio(
        firmantePendiente,
        processId,
        numeroDocumento,  // ✅ Usar numeroDocumento en vez de numContrato
        nombreCliente,
        asunto,
        esConvenio
      );
      console.log(`📧 Recordatorio enviado a ${firmantePendiente}`);
    }

    // ⏱️ Delay de 500ms para asegurar que las operaciones asíncronas se completen
    await sleep(500);

    console.log(`\n========================================`);
    console.log(`🔍 VERIFICANDO ENVÍO A DIRECTOR:`);
    console.log(`   📍 zona recibida: "${zona}"`);
    console.log(`   📍 firmante: "${firmante}"`);
    console.log(`   📍 cedulaFirmante: "${cedulaFirmante}"`);
    console.log(`   📍 correoDirector (BD): ${correoDirector}`);
    console.log(`   📍 tipo correoDirector: ${typeof correoDirector}`);
    console.log(`   📍 esConvenio: ${esConvenio}`);
    
    const ccValidos = ["67012593", "94492994"];
    console.log(`   📍 ccValidos: [${ccValidos.join(", ")}]`);
    console.log(`   📍 ccValidos.includes("${cedulaFirmante}"): ${ccValidos.includes(cedulaFirmante)}`);
    console.log(`   📍 correoDirector === false: ${correoDirector === false}`);
    console.log(`   📍 Condición completa: ${ccValidos.includes(cedulaFirmante) && correoDirector === false}`);
    console.log(`========================================\n`);

    // 📌 2️⃣ Enviar correo al director si firmó Lilian o César y aún no se ha notificado
    if (ccValidos.includes(cedulaFirmante) && correoDirector === false) {
      
      // 🚫 Validar si se debe enviar correo cuando es convenio
      if (esConvenio && !ENVIAR_CORREO_DIRECTOR_CONVENIOS) {
        console.log(`⚠️ Convenio detectado - NO se envía correo al director (configuración: ENVIAR_CORREO_DIRECTOR_CONVENIOS = false)`);
      } else {
        console.log(`🎯 ✅ ENTRANDO al bloque del director...`);
        
        // Normalizar la zona
        let zonaNormalizada = ["Antioquia", "Centro"].includes(zona) ? zona : "Regiones";
        console.log(`📍 Zona normalizada: "${zona}" → "${zonaNormalizada}"`);

        // Buscar director por zona normalizada
        const director = await Director.findOne({ zona: zonaNormalizada });
        if (!director) {
          console.error(`❌ No se encontró director para la zona: ${zonaNormalizada}`);
          return res.status(404).json({ error: `No se encontró director para la zona: ${zonaNormalizada}` });
        }

        console.log(`👤 Director encontrado: ${director.name} ${director.last_name} (${director.email})`);

        const fechaEnvio = new Date().toLocaleDateString("es-CO");

        const html = emailDirectorTemplate(
          `${director.name} ${director.last_name}`,
          numeroDocumento,  // ✅ Usar numeroDocumento en vez de numContrato
          nombreCliente,
          fechaEnvio,
          firmante,
          esConvenio
        );

        console.log(`📤 Enviando correo al director...`);
        await enviarCorreoDirector(director.email, html, esConvenio, numeroDocumento);

        // ✅ Marcar como enviado y guardar zona ya normalizada
        proceso.correoDirector = true;
        proceso.zona = zonaNormalizada;
        await proceso.save();

        console.log("✅ Correo enviado al director y BD actualizada");
      }
    } else {
      console.log(`⚠️ NO se envió correo al director (condición no cumplida)`);
    }

    console.log(`\n✅ Flujo completado exitosamente\n`);
    return res.status(200).json({ message: "✅ Flujo de recordatorio procesado correctamente" });

  } catch (error) {
    console.error("\n❌ ERROR EN FLUJO DE RECORDATORIO:");
    console.error("   Mensaje:", error.message);
    console.error("   Stack:", error.stack);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};