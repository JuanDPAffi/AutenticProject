// src/services/procesarArchivoService.js

import axios from "axios";
import FormData from "form-data";
import { obtenerTokenHubSpot } from "./hubspotService.js";
import { obtenerNumeroConvenioPorContrato } from "./convenioService.js";

const custom_objet_id = "2-27967747";
const type_id_vinculacion_notas = "63";

async function adjuntarArchivoService(id_objeto, id_nota) {
  const token = await obtenerTokenHubSpot();
  const url = `https://api.hubapi.com/crm/v3/objects/notes/${id_nota}/associations/${custom_objet_id}/${id_objeto}/${type_id_vinculacion_notas}`;

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
      hs_note_body: "Contrato de fianza firmado automáticamente desde Autentic"
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

// 👉 Carga un archivo (buffer) a HubSpot y le da un nombre formateado
async function crearArchivoService(nombre_inm, num_contrato, { name, buffer }, numeroConvenio = null) {
  const token = await obtenerTokenHubSpot();
  const formData = new FormData();

  function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
  }

  const nombreNormalizado = normalizarTexto(nombre_inm);
  let nuevoNombre;

  if (name && name.toUpperCase().includes("REGLAMENTO")) {
    nuevoNombre = `REGLAMENTO_DE_FIANZA_AFFI.pdf`;
  } else if (name && name.toUpperCase().includes("CONVENIO")) {
    nuevoNombre = `CONVENIO_FIRMA_DIGITAL_${numeroConvenio}.pdf`;
  } else {
    nuevoNombre = `CONTRATO_DE_FIANZA_COLECTIVA_${num_contrato}_${nombreNormalizado}.pdf`;
  }

  console.log("📄 Nombre del archivo enviado a HubSpot:", nuevoNombre);

  formData.append("file", buffer, nuevoNombre);
  formData.append("options", JSON.stringify({ access: "PUBLIC_INDEXABLE" }));
  formData.append("folderPath", "/Contratos_Fianzas");

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

    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      JSON.stringify(
        { success: false, error: error.response?.data || error.message },
        null,
        2
      )
    );
    return { success: false, error: error.response?.data || error.message };
  }
}


export async function procesarArchivoService(id_vinculacion, nombre_inm, num_contrato, fileBuffer) {
  const resultados = [];
  const errores = [];

  // 🔍 Buscar número de convenio si hay archivo tipo CONVENIO
  let numeroConvenio = null;
  const hayConvenio = fileBuffer.some(file => file.name.toUpperCase().includes("CONVENIO"));
  if (hayConvenio) {
    numeroConvenio = await obtenerNumeroConvenioPorContrato(num_contrato);
    if (!numeroConvenio) {
      throw new Error(`No se encontró número de convenio para el contrato ${num_contrato}`);
    }
    console.log(`🔢 Número de convenio encontrado: ${numeroConvenio}`);
  }

  for (const file of fileBuffer) {
    try {
      const archivoResponse = await crearArchivoService(nombre_inm, num_contrato, file, numeroConvenio);
      if (!archivoResponse.success) throw new Error(archivoResponse.error);

      const idArchivo = archivoResponse.data.id;

      const notaResponse = await crearNotaService(idArchivo);
      if (!notaResponse.success) throw new Error(notaResponse.error);

      const idNota = notaResponse.data.id;

      await adjuntarArchivoService(id_vinculacion, idNota);

      resultados.push({
        archivo: archivoResponse.data,
        nota: notaResponse.data,
        vinculacion: id_vinculacion
      });

    } catch (error) {
      errores.push({ archivo: file.name, error: error.message });
    }
  }

  return { resultados, errores };
}
