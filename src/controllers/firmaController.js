// controllers/firmaController.js
import { generarContratoPDF } from "../services/contratoService.js";
import { obtenerFirmantes } from "../services/firmaService.js";
import { enviarParaFirma } from "../services/autenticService.js";
import { obtenerAccessTokenHubSpot, obtenerDatosVinculacion } from "../services/hubspotService.js";

export async function ejecutarProcesoFirma(req, res) {
  try {
    let datos = req.body;

    // 🔍 Consultar datos desde HubSpot si solo se envía el ID
    if (!datos.tipo_persona && datos.idVinculacion) {
      console.log("🔎 Consultando datos en HubSpot para idVinculacion:", datos.idVinculacion);
      const token = await obtenerAccessTokenHubSpot();
      const propiedades = await obtenerDatosVinculacion(datos.idVinculacion, token);
      datos = propiedades;
    }

    console.log("📬 Datos obtenidos:", datos);

    // 🐞 Modo debug desde el payload (manual)
    if (datos.debug === true || datos.debug === "true") {
      console.log("🐞 Modo DEBUG activado desde el payload, no se genera contrato ni se envía a Autentic");
      return res.status(200).json({ message: "DEBUG activado", datosRecibidos: datos });
    }

    // ✅ Validar campos obligatorios antes de continuar
    if (!datos.tipo_persona || !datos.ciudad) {
      console.warn("⚠️ Faltan campos obligatorios: tipo_persona y/o ciudad");
      return res.status(400).json({
        error: "Faltan datos obligatorios: tipo_persona y/o ciudad",
        datosRecibidos: datos,
      });
    }

    // 🧪 MODO_PRUEBA desde variable de entorno (Azure)
    if (process.env.MODO_PRUEBA === "true") {
      const firmantes = await obtenerFirmantes(datos);
      const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);

      console.log("🧪 MODO PRUEBA ACTIVADO - Solo generamos contratos, no se envía a Autentic");
      return res.status(200).json({
        message: "Modo prueba activado - contratos generados pero NO enviados a firma",
        firmantes,
        datosUsados: datos,
      });
    }

    // 🔐 Producción real: firmar con Autentic
    const firmantes = await obtenerFirmantes(datos);
    const [base64PDF, base64Reglamento] = await generarContratoPDF(datos);
    const resultado = await enviarParaFirma(base64Reglamento, base64PDF, firmantes);

    res.status(200).json({ message: "Proceso de firma iniciado", resultado });

  } catch (error) {
    console.error("❌ Error en ejecutarProcesoFirma:", error);
    res.status(500).json({ error: "Error al iniciar el proceso de firma" });
  }
}
