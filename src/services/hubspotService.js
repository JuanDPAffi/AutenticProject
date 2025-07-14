import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
dotenv.config();

const {
  END_POINT_GET_TOKEN_API_HUBSPOT,
  CLIENT_ID_HUBSPOT,
  CLIENT_SECRET_HUBSPOT,
  REFRESH_TOKEN_HUBSPOT
} = process.env;

// 1️⃣ Obtener access_token desde el refresh_token
export async function obtenerTokenHubSpot() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", CLIENT_ID_HUBSPOT);
    params.append("client_secret", CLIENT_SECRET_HUBSPOT);
    params.append("refresh_token", REFRESH_TOKEN_HUBSPOT);

    const { data } = await axios.post(END_POINT_GET_TOKEN_API_HUBSPOT, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const token = data.access_token;
    console.log("🔑 Token de HubSpot obtenido correctamente");
    return token;

  } catch (error) {
    console.error("❌ Error obteniendo token HubSpot:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el token de HubSpot");
  }
}

// 2️⃣ Subir archivo como adjunto a HubSpot
export async function subirArchivoAHubSpot(archivo, nombreArchivo, token) {
  try {
    const form = new FormData();

    form.append("file", archivo.buffer, { filename: nombreArchivo });
    form.append("fileName", nombreArchivo);
    form.append("access", "PRIVATE");

    // ✅ Campo requerido: options con folderPath incluido
    form.append("options", JSON.stringify({
      access: "PRIVATE",
      overwrite: false,
      duplicateValidationStrategy: "NONE",
      duplicateValidationScope: "ENTIRE_PORTAL",
      folderPath: "Contratos Firmados/AFFI" // Puedes personalizarlo
    }));

    const { data } = await axios.post("https://api.hubapi.com/files/v3/files", form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log(`📎 Archivo subido correctamente: ${nombreArchivo}`);
    return data.id;

  } catch (error) {
    console.error("❌ Error al subir archivo:", error.response?.data || error.message);
    throw new Error("Error al subir archivo a HubSpot");
  }
}

// 3️⃣ Crear una nota con el archivo adjunto
export async function crearNota(fileId, nombreArchivo, token) {
  try {
    const nota = {
      properties: {
        hs_timestamp: Date.now(),
        hs_note_body: `📝 Se cargó automáticamente el contrato firmado: ${nombreArchivo}`
      },
      associations: [
        {
          to: { id: fileId },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 17 } // Nota → Archivo
          ]
        }
      ]
    };

    const { data } = await axios.post("https://api.hubapi.com/crm/v3/objects/notes", nota, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("🗒️ Nota creada con éxito");
    return data.id;

  } catch (error) {
    console.error("❌ Error creando nota:", error.response?.data || error.message);
    throw new Error("No se pudo crear la nota en HubSpot");
  }
}

// 4️⃣ Asociar nota a la vinculación personalizada
export async function asociarNotaARegistro(idNota, idVinculacion, token) {
  try {
    const objectTypeId = "2-16654045"; // ID de objeto personalizado: Vinculación

    await axios.put(
      `https://api.hubapi.com/crm/v3/objects/notes/${idNota}/associations/${objectTypeId}/${idVinculacion}/note_to_${objectTypeId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("🔗 Nota asociada a la vinculación correctamente");

  } catch (error) {
    console.error("❌ Error asociando nota al registro:", error.response?.data || error.message);
    throw new Error("No se pudo asociar la nota al registro de vinculación");
  }
}
