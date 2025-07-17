// src\templates\templateEmailGerentes.js

const emailRemember = (nombre_destinatario,num_contrato, nombre_cliente, fecha_envio_correo, process_id,asunto) => `
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f7; padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1); border:1px solid #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333;">
            <tr>
              <td>
                <h2 style="color:#1a202c; margin-bottom:20px;">¡Hola <strong>${nombre_destinatario}</strong>!</h2>
                <p style="font-size:16px; line-height:1.6;">
                  Este es un recordatorio de que aún está pendiente la firma del contrato: 
                </p>

                <div style="background-color:#f9fafb; border-left:4px solid #2b2d77; padding:15px 20px; margin-top:20px; border-radius:6px; font-size:15px;">
                  <p><strong>📄 Número de contrato:</strong> ${num_contrato}</p>
                  <p><strong>🏣 Nombre cliente:</strong> ${nombre_cliente}</p>
                  <p><strong>🪧 Asunto del correo:</strong> ${asunto}</p>
                  <p><strong>📅 Fecha de envío:</strong> ${fecha_envio_correo}</p>
                  <p><strong>🪪 Process Id:</strong> ${process_id}</p>
                </div>

                <p style="font-size:16px; line-height:1.6; margin-top:20px;">
                <strong>Nota</strong>: Por favor revisa tu bandeja de entrada en la fecha de envío para ver el correo con el enlace para firmar.
                </p>
                <p style="margin-top:30px; font-size:13px; color:#888; text-align:center;">
                  Gracias por tu atención.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;">
                <hr style="border:none; border-top:1px solid #e0e0e0;" />
                <p style="font-size:13px; color:#999; text-align:center; margin-top:20px;">
                  Siempre Moviéndonos Hacia Adelante
                </p>
                <p style="font-size:12px; text-align:center;">
                  <a href="#" style="margin: 0 10px; text-decoration:none; color:#4a90e2;">Facebook</a> |
                  <a href="#" style="margin: 0 10px; text-decoration:none; color:#4a90e2;">LinkedIn</a> |
                  <a href="#" style="margin: 0 10px; text-decoration:none; color:#4a90e2;">X</a> |
                  <a href="#" style="margin: 0 10px; text-decoration:none; color:#4a90e2;">Instagram</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
`;

export default emailRemember