import Proceso from "../models/proceso.model.js";
import getDatosEmailRemember from "../utils/getDatosEmailRemember.js";

export const registrarProcesoDesdeCorreo = async (req, res) => {
  try {
    const { bodyHtml } = req.body;

    if (!bodyHtml) {
      return res.status(400).json({ error: "bodyHtml es requerido" });
    }

    const datos = getDatosEmailRemember(bodyHtml);

    await Proceso.create(datos);

    res.status(200).json({ message: "✅ Proceso registrado correctamente", datos });

  } catch (error) {
    console.error("❌ Error al registrar proceso:", error.message);
    res.status(500).json({ error: error.message });
  }
};
