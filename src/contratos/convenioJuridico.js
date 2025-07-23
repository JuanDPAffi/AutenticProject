
import {
  Document,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  HeightRule,
  VerticalAlign
} from "docx";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generarNumeroConvenio } from "../services/convenioService.js";

// const rutaJSON = "/tmp/datosTemp.json"; produccion
const rutaJSON = path.resolve("tmp/datosTemp.json");
const raw = readFileSync(rutaJSON, "utf-8");
const input = JSON.parse(raw);

function formatearNumeroConPuntos(numero) {
  const numStr = numero.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 🧾 Preparar datos del contrato
const data = {
  NUMERO_CONTRATO: input.numero_de_contrato,
  NOMBRE_INMOBILIARIA: input.nombre_inmobiliaria,
  CIUDAD_INMOBILIARIA: input.ciudad_inmobiliaria,
  NIT_INMOBILIARIA: formatearNumeroConPuntos(input.nit_inmobiliaria),
  NOMBRE_REPRESENTANTE_LEGAL: input.nombre_representante_legal,
  APELLIDO_REPRESENTANTE_LEGAL: input.apellido_representante_legal,
  CEDULA_REPRESENTANTE_LEGAL: formatearNumeroConPuntos(input.cedula_representante_legal),
  CIUDAD_EXPEDICION: input.ciudad_expedicion,
  CORREO: input.correo
};

const numeroConvenio = input.numero_convenio_digital;

console.log("✅ Datos para el contrato:", data);

// 🔠 Convertir todo a mayúsculas
Object.keys(data).forEach(key => {
  if (typeof data[key] === "string") {
    data[key] = data[key].toUpperCase();
  }
});

// Obtener __dirname (en módulos ES)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo JSON
const rutaCiudades = path.join(__dirname, "ciudades.json");
const capitalesDepartamentales = JSON.parse(readFileSync(rutaCiudades, "utf-8"));

const ciudad = input.ciudad_inmobiliaria;
const esCapitalDepartamental = capitalesDepartamentales.includes(ciudad);

const UBICACION_GEOGRAFICA = esCapitalDepartamental
  ? `en la ciudad de ${ciudad.toUpperCase()}`
  : `en el municipio de ${ciudad.toUpperCase()}`;


const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: "Arial MT",
          size: 22
        },
      }
    }
  },
  numbering: {
    config: [
      {
        reference: "numeracion",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "1.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "1.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "1.%1.%2.%3.",
            alignment: AlignmentType.LEFT
          },
        ],
      },
      {
        reference: "numeracion4",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "4.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "4.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "4.%1.%2.%3.",
            alignment: AlignmentType.LEFT
          },
        ],
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840,
        },
        margin: {
        top: 1218,     // 2.15 cm
        bottom: 278,   // 0.49 cm
        left: 1300,    // 2.93 cm
        right: 1202,   // 2.12 cm
        header: 726,   // 1.28 cm
        footer: 0      // 0 cm
        }
      }
    },
    headers: {
        default: new Header({
            children: [
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                new TextRun({
                    text: numeroConvenio,
                    font: "Arial MT",
                    size: 22,
                }),
                ],
            }),
            ],
        }),
    },
    
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `CONVENIO COMERCIAL FIRMA DIGITAL SUJETO`,
            bold: true,
            font: 'Arial MT',
            size: 22,
            underline: true,
          }),
          new TextRun({ break: 1 }),
          new TextRun({
            text: ` A CONDICIÓN RESOLUTORIA EXPRESA`,
            bold: true,
            font: 'Arial MT',
            size: 22,
            underline: true,
          })
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        style: "Heading1",
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 0, line: 480 },
        children: [
          new TextRun({ text: 'PARTES', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'LA EMPRESA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: data.NOMBRE_INMOBILIARIA, bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Persona jurídica debidamente constituida y con domicilio ${UBICACION_GEOGRAFICA}, identificada con el NIT No. ${data.NIT_INMOBILIARIA} representada legalmente por ${data.NOMBRE_REPRESENTANTE_LEGAL} persona mayor de edad, domiciliado y residente en ${data.CIUDAD_INMOBILIARIA}, identificado con la cédula de ciudadanía No. ${data.CEDULA_REPRESENTANTE_LEGAL} y quien para todos los efectos legales del presente convenio suministra el correo electrónico ${data.CORREO} y que para los efectos de este convenio se llamará simplemente `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({ text: '.', font: 'Arial MT', size: 22 }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'LA AFIANZADORA', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'AFFI S.A.S.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` persona jurídica debidamente constituida, con domicilio principal en la ciudad de Cali, y sucursal en Bogotá D.C., identificada con el NIT No. 900.053.370-2 representada legalmente por CESAR AUGUSTO TEZNA CASTAÑO, también mayor de edad, domiciliado y residente en la ciudad de Santiago de Cali, identificado con la C.C. No. 94.492994 en su condición de Gerente, y que para efectos de este convenio se llamará simplemente `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'Affi', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({ text: '.', font: 'Arial MT', size: 22 }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        style: "Heading1",
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 480 },
        children: [
          new TextRun({ text: 'ANTECEDENTES', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'PRIMERO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({ text: ' LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000'}),
          new TextRun({
            text: ` es una empresa comercial ampliamente reconocida en el sector inmobiliario, que su objeto social principal es recibir bienes inmuebles de sus propietarios en Administración para luego ofrecerlos al mercado y darlos en arrendamiento a terceros. Pero igualmente realiza otras actividades comerciales como corretaje en la enajenación de inmuebles y todas las actividades afines al sector inmobiliario.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'SEGUNDO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Por su Parte AFFI S.A.S., como entidad de derecho privado cuenta igualmente con un amplio reconocimiento en todo el territorio colombiano dentro del sector inmobiliario por la calidad y cumplimiento en las obligaciones que adquiere en virtud de los servicios de fianza colectiva que brinda a sus clientes. Su objeto comercial principal, pactado en un CONTRATO DE FIANZA COLECTIVA, es comprometerse para con la ARRENDADORA a garantizar las obligaciones derivadas de los contratos de arrendamiento suscritos por ella en dicha condición y las personas naturales y/o jurídicas que adquieran en virtud de dichos contratos de arrendamiento la condición de ARRENDATARIOS DEUDORES, previo el estudio jurídico efectuado por la AFIANZADORA, todo de conformidad al REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `En el marco de su desarrollo comercial, AFFI S.A.S. ha decidido prestar servicios complementarios a `,
            font: 'Arial MT',
            size: 22
          }),
            new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` para que pueda desarrollar de mejor forma su actividad comercial principal con el apoyo de las nuevas tecnologías que se encuentran en el mercado.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'TERCERO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Entre las empresas aquí firmantes se suscribió el contrato de fianza colectiva en virtud del cual AFFI S.A.S. se compromete con `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` a garantizar las obligaciones derivadas de los contratos de arrendamiento suscritos por `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` en su calidad de arrendador y las personas naturales y/o jurídicas que adquieran en virtud de dichos contratos de arrendamiento la condición de ARRENDATARIOS DEUDORES, previo el estudio jurídico efectuado por la AFIANZADORA y `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` se compromete con AFFI S.A.S. en virtud de dicho acuerdo a cumplir en todo momento el CONTRATO DE FIANZA COLECTIVA celebrado y el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'CUARTO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Es voluntad de las partes aquí firmantes celebrar el presente CONVENIO COMERCIAL SUJETO A CONDICION RESOLUTORIA EXPRESA en virtud del cual, mientras esté vigente el CONTRATO DE FIANZA COLECTIVA, AFFI S.A.S. le preste servicios adicionales y complementarios a `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` en los términos que se indicarán más adelante.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'QUINTO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` AFFI S.A.S. ha celebrado un CONTRATO PARA LA IMPLEMENTACIÓN Y USO DE LA PLATAFORMA DE `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'FIRMA ELECTRÓNICA AUTENTIC SIGN', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` con la sociedad AUTENTIC LATAM S.A.S. Sin embargo, AFFI S.A.S. en un futuro podrá celebrar convenios con otras empresas que ofrezcan este o un mejor servicio para AFFI y para sus INMOBILIARIAS. Este ACUERDO ha implicado unos costos importantes de vinculación y de adecuación de la tecnología, que en ningún momento será trasladado a `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: `. Es un costo que asume AFFI S.A.S. como propuesta de valor para sus clientes.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'SEXTO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` AFFI S.A.S., como parte del servicio opcional, voluntario, unilateral y mediante este CONVENIO, permitirá a LA INMOBILIARIA que sus contratos de arrendamiento que se vayan a vincular al CONTRATO DE FIANZA COLECTIVA con AFFI S.A.S. se puedan firmar electrónicamente por todas las partes (ARRENDADOR, ARRENDATARIO, DEUDORES SOLIDARIOS) y de esa forma permitirle a la INMOBILIARIA estar en el mercado con nueva tecnología y dar facilidades para que sus contratos de arrendamiento se legalicen de una forma ágil y segura. Y con fundamento en este CONVENIO, AFFI proporciona unas condiciones más favorables y por volumen, de tal manera que será menos costoso para `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` que si lo contratara en forma directa.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        style: "Heading1",
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 480 },
        children: [
          new TextRun({ text: 'TÉRMINOS DEL CONVENIO', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'PRIMERA. OBJETÓ DEL CONVENIO: ', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` AFFI S.A.S. permitirá que `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000'}),
          new TextRun({
            text: ` utilice para la firma digital de los CONTRATOS DE ARRENDAMIENTO que serán AFIANZADOS por AFFI S.A.S., la PLATAFORMA DIGITAL AUTENTIC SIGN conforme a los términos y condiciones que para su uso tiene establecido la sociedad AUTENTIC LATAM S.A.S.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Este uso se hará bajo las siguientes condiciones:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 1.1.
      new Paragraph({
        numbering: { reference: "numeracion", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' se obliga a ajustar sus NUEVOS MODELOS DE CONTRATO DE ARRENDAMIENTO ',
            size: 22
          }),
          new TextRun({ text: 'que serán afianzados con AFFI S.A.S.', bold: true, font: 'Arial MT', size: 22, underline: true }),
          new TextRun({
            text: ' con una cláusula que señale expresamente lo siguiente:',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'AUTORIZACIÓN PARA FIRMA ELECTRÓNICA:', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` Las Partes declaran que el presente contrato será firmado electrónicamente; así mismo declaran que la aplicación utilizada provee un mecanismo de firma electrónica confiable que garantiza el cumplimiento de los requisitos previstos en la legislación vigente (Ley 527 de 1999, y demás normas que la reglamentan): autenticidad (identidad de los firmantes), integridad (no alteración del documento luego de su firma) y no repudio.`,
            font: 'Arial MT',
            size: 22,
            italics: true
          }),
        ]
      }),

      new Paragraph({}),

      // 1.2.
      new Paragraph({
        numbering: { reference: "numeracion", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' se obliga en relación con la firma digital de los NUEVOS CONTRATOS DE ARRENDAMIENTO ',
            size: 22
          }),
          new TextRun({ text: 'que serán afianzados con AFFI S.A.S.', bold: true, font: 'Arial MT', size: 22, underline: true }),
          new TextRun({
            text: ' a cumplir con estas obligaciones especiales al realizar la FIRMA DIGITAL DE ARRENDATARIOS Y DEUDORES SOLIDARIOS:',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 1.2.1
      new Paragraph({
        numbering: { reference: "numeracion", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Deberá SIEMPRE enviar a los ARRENDATARIOS Y DEUDORES SOLIDARIOS la información para la FIRMA DIGITAL UNICA Y EXCLUSIVAMENTE a los teléfonos y correos electrónicos que se hayan enviado a AFFI S.A.S. en el formulario de la solicitud del estudio de riesgo y que AFFI S.A.S. haya validado a través del acta de resultado. ',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` debe conservar en sus archivos digitales toda la información que corresponda al CONTRATO DE ARRENDAMIENTO AFIANZADO POR AFFI S.A.S. y que ha sido firmado digitalmente. Será ÚNICA Y EXCLUSIVA responsabilidad de `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` la custodia de los contratos firmados digitalmente.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 1.3.
      new Paragraph({
        numbering: { reference: "numeracion", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Si por circunstancias de los usuarios, se cometen errores y se causan mayores costos en CENTRALES DE RIESGO y/o AUTENTIC SIGN, este mayor costo se le causará a ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` y ella tendrá el derecho de exigirlo a sus clientes o arrendatarios según sea el caso.`,
            font: 'Arial MT',
            size: 22,
            italics: true
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'PARÁGRAFO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Cumpliendo las obligaciones y deberes señalados en este punto, el contrato de arrendamiento quedará debidamente afianzado ante AFFI S.A.S. Si existiere algún error o inconformidad, AFFI S.A.S. procederá a realizar oportunamente OBSERVACIONES al contrato de arrendamiento para que la INMOBILIARIA proceda a corregirlas.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'SEGUNDA. SERVICIO COMPLEMENTARIO PARA LA INMOBILIARIA:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({ text: ' LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` podrá utilizar la PLATAFORMA DE FIRMA DIGITAL para la firma de `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'otros documentos', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` (contratos de mandato, promesas de venta, títulos valores, otros contratos) que no tengan relación alguna con los CONTRATOS   DE   ARRENDAMIENTO   AFIANZADOS   CON   AFFI S.A.S.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'TERCERA. TARIFAS DEL SERVICIO DE FIRMA DIGITAL:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` La tabla #1 contiene las tarifas vigentes por cada documento firmado y dicha tarifa estará definida de acuerdo con el monto afianzado que tenga al corte mensual de la facturación del servicio de fianza.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: "TABLA #1. TARIFAS VIGENTES",
            font: "Arial MT",
            size: 22,
          }),
        ],
      }),
      new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: [
          new TableRow({
            height: { value: 600, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: {
                  fill: "D9D9D9",
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "MONTO AFIANZADO", bold: true, size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: {
                  fill: "D9D9D9",
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "VALOR POR SOBRE", bold: true, size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 1
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "MAYOR A $300.000.001 MM", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$4.000", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 2
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "$150.000.000 MM A $300.000.000 MM", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$4.500", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 3
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "$50.000.000 A $149.999.999", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$5.000", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 4
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "$10.000.000 A $49.999.999 MM", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$7.000", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      new Paragraph({}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 240, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'Condiciones comerciales:', bold: true, font: 'Arial MT', size: 22, underline: true }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `El valor indicado corresponde al valor por firma de un documento (la cantidad de firmas dentro del documento es ilimitada)`,
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `El único método de autenticación incluido en estas tarifas es el de OTP Esencial.`,
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Todos los servicios de verificaciones tienen cargo (ver costos abajo)`,
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Valores no incluyen IVA`,
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({
        children: [
          new TextRun({ break: 1 }),
      ]}),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'CUARTA. SERVICIOS ADICIONALES NO INCLUIDOS.', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` La PLATAFORMA ofrece diferentes métodos de verificación de identidad, que están a disposición de `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000' }),
          new TextRun({
            text: ` y podrá hacer uso de cualquiera de ellos en calidad de servicios adicionales por demanda. Algunos de estos servicios adicionales podrán ser operados o ejecutados por terceras partes aliados de AUTENTIC SIGN. En virtud de lo anterior, estos terceros serán los responsables exclusivos por el funcionamiento u operación de dicho servicio adicional.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 4.1.
      new Paragraph({
        numbering: { reference: "numeracion4", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 240, line: 240 },
        children: [
          new TextRun({ text: 'Tarifas:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: '  El valor que deba cancelar LA INMOBILIARIA por concepto de servicios adicionales, son los prestados actualmente por AUTENTIC SIGN, pero podrá ser a futuro cualquier otro proveedor que para el efecto ofrezca un mejor producto a un menor precio.',
            size: 22
          }),
        ],
      }),

      new Paragraph({
        children: [
          new TextRun({ break: 1 }),
      ]}),

      new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: [
          new TableRow({
            height: { value: 600, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: {
                  fill: "D9D9D9",
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "ENTIDAD VERIFICADORA", bold: true, size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: {
                  fill: "D9D9D9",
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "VALOR", bold: true, size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 1
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "OTP a celular autenticado (Centrales de Riesgo)", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$2.500 por persona", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 2
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "Preguntas de autenticación (Centrales de Riesgo)", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$5.000 por persona", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
          // Fila 3
          new TableRow({
            height: { value: 500, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "Reconocimiento facial (Documento de identidad)", size: 22, font: "Arial MT" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [ new TextRun({ text: "$5.000 por persona", size: 22, font: "Arial MT" }) ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      new Paragraph({
        children: [
          new TextRun({ break: 1 }),
      ]}),


    ]
  }]
});

// 💾 Guardar el archivo
Packer.toBuffer(doc).then(buffer => {
  writeFileSync("src/contratos/CONVENIO_FIRMA_DIGITAL.docx", buffer);
  console.log("✅ Convenio juridico generado con éxito");
});
