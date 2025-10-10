// src/services/procesarArchivoConvenioService.js

import axios from "axios";
import FormData from "form-data";
import { obtenerTokenHubSpot } from "./hubspotService.js";

const custom_objet_id = "2-24411421";
const type_id_convenio_notas = "35";

async function adjuntarArchivoService(id_objeto, id_nota) {
  const token = await obtenerTokenHubSpot();
  const url = `https://api.hubapi.com/crm/v3/objects/notes/${id_nota}/associations/${custom_objet_id}/${id_objeto}/${type_id_convenio_notas}`;

  const response = await axios.put(url, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  console.log("🔗 Nota asociada:", response.data);
  return response.data;
}

async function crearNotaService(id_file_uploaded) {
  const token = await obtenerTokenHubSpot();
  const url = `https://api.hubapi.com/crm/v3/objects/notes`;

  const payload = {
    properties: {
      hs_timestamp: Date.now(),
      hubspot_owner_id: "664132265",
      hs_attachment_ids: id_file_uploaded,
      hs_note_body: "Convenio de firma digital firmado automáticamente desde Autentic"
    }
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  console.log("📝 Nota creada:", response.data.id);
  return { success: true, data: response.data };
}

// 👉 Sube el convenio de firma digital a HubSpot
async function crearArchivoService(num_convenio, buffer) {
  const token = await obtenerTokenHubSpot();
  const formData = new FormData();

  // ✅ Siempre es un convenio de firma digital
  const nombreArchivo = `CONVENIO_FIRMA_DIGITAL_${num_convenio}.pdf`;
  console.log("📄 Subiendo archivo a HubSpot:", nombreArchivo);

  formData.append("file", buffer, nombreArchivo);
  formData.append("folderPath", "/Convenios_Firma_Digital");
  formData.append("options", JSON.stringify({ 
    access: "PUBLIC_INDEXABLE",
    overwrite: false,
    duplicateValidationStrategy: "NONE",
    duplicateValidationScope: "ENTIRE_PORTAL"
  }));

  try {
    const response = await axios.post(
      "https://api.hubapi.com/files/v3/files",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ Archivo subido a HubSpot con ID:", response.data.id);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Error al subir archivo a HubSpot:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}


/**
 * Procesa y sube el convenio de firma digital a HubSpot
 * @param {number} id_convenio - ID del convenio en HubSpot
 * @param {string} num_convenio - Número del convenio (ej: "FD5247")
 * @param {Array} fileBuffer - Array con el archivo descargado de Autentic (siempre 1 archivo)
 * @returns {Object} - Resultado del proceso
 */
export async function procesarArchivoConvenioService(id_convenio, nombre_inm, num_convenio, fileBuffer) {
  try {
    console.log(`🚀 Procesando convenio de firma digital: ${num_convenio}`);

    // ✅ Siempre es 1 solo archivo (el convenio)
    const archivo = fileBuffer[0];
    
    if (!archivo) {
      throw new Error("No se recibió ningún archivo para procesar");
    }

    console.log(`📦 Procesando archivo: ${archivo.name}`);

    // 1️⃣ Subir archivo a HubSpot
    const archivoResponse = await crearArchivoService(num_convenio, archivo.buffer);
    if (!archivoResponse.success) {
      throw new Error(`Error al subir archivo: ${archivoResponse.error}`);
    }

    const idArchivo = archivoResponse.data.id;

    // 2️⃣ Crear nota con el archivo adjunto
    const notaResponse = await crearNotaService(idArchivo);
    if (!notaResponse.success) {
      throw new Error(`Error al crear nota: ${notaResponse.error}`);
    }

    const idNota = notaResponse.data.id;

    // 3️⃣ Asociar nota al convenio
    await adjuntarArchivoService(id_convenio, idNota);

    console.log(`✅ Convenio ${num_convenio} procesado exitosamente`);

    return {
      resultados: [{
        convenio: num_convenio,
        archivoId: idArchivo,
        notaId: idNota,
        convenioId: id_convenio
      }],
      errores: []
    };

  } catch (error) {
    console.error(`❌ Error procesando convenio:`, error.message);
    return {
      resultados: [],
      errores: [{ 
        convenio: num_convenio, 
        error: error.message 
      }]
    };
  }
}