// src/services/procesarArchivoConvenioService.js
import axios from "axios";
import { obtenerTokenHubSpot } from "./hubspotService.js";
import { obtenerNumeroConvenioPorContrato } from "./convenioService.js";

/**
 * Procesa los archivos firmados de un convenio, los sube a HubSpot y los asocia al registro de Convenio.
 */
export async function procesarArchivoConvenioService(id_convenio, nombre_inm, num_contrato, archivos) {
  const resultados = [];
  const errores = [];

  const token = await obtenerTokenHubSpot();

  // Solo tomar archivos que sean del convenio
  const convenios = archivos.filter(a =>
    a.name?.toUpperCase().includes("CONVENIO")
  );

  if (convenios.length === 0) {
    throw new Error("No se encontró archivo de CONVENIO en los documentos firmados.");
  }

  // Buscar el número de convenio desde Mongo
  const numeroConvenio = await obtenerNumeroConvenioPorContrato(num_contrato);
  if (!numeroConvenio) {
    throw new Error(`No se encontró número de convenio para el contrato ${num_contrato}`);
  }

  for (const archivo of convenios) {
    try {
      // Subir archivo a HubSpot
      const formData = new FormData();
      const nombreArchivo = `CONVENIO_FIRMA_DIGITAL_${numeroConvenio}.pdf`;

      formData.append("file", archivo.buffer, nombreArchivo);
      formData.append("options", JSON.stringify({
        access: "PRIVATE",
        overwrite: false,
        folderPath: "Convenios Firmados/AFFI"
      }));

      const subida = await axios.post("https://api.hubapi.com/files/v3/files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });

      const idFile = subida.data.id;
      console.log(`📎 Archivo de convenio subido: ${nombreArchivo}`);

      // Crear nota en HubSpot
      const nota = {
        properties: {
          hs_timestamp: Date.now(),
          hs_note_body: `📄 Se cargó automáticamente el convenio firmado: ${nombreArchivo}`
        },
        associations: [
          {
            to: { id: idFile },
            types: [
              { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 17 } // Nota → Archivo
            ]
          }
        ]
      };

      const notaCreada = await axios.post("https://api.hubapi.com/crm/v3/objects/notes", nota, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const idNota = notaCreada.data.id;
      console.log(`🗒️ Nota creada (Convenio): ${idNota}`);

      // Asociar nota al registro de Convenio (objeto 2-24411421)
      const objectTypeId = "2-24411421";
      const associationType = "note_to_2-24411421"; // alias de asociación

      await axios.put(
        `https://api.hubapi.com/crm/v3/objects/notes/${idNota}/associations/${objectTypeId}/${id_convenio}/${associationType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`🔗 Nota asociada al convenio ${id_convenio}`);

      resultados.push({ archivo: nombreArchivo, nota: idNota });
    } catch (error) {
      errores.push({
        archivo: archivo.name,
        error: error.response?.data || error.message
      });
    }
  }

  return { resultados, errores };
}
