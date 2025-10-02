
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

const rutaJSON = "/tmp/datosTemp.json";
// const rutaJSON = path.resolve("tmp/datosTemp.json");
const raw = readFileSync(rutaJSON, "utf-8");
const input = JSON.parse(raw);

function numeroALetrasDia(n) {
  const dias = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
    "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés",
    "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho",
    "veintinueve", "treinta", "treinta y uno"
  ];
  return dias[n];
}

const hoy = new Date();
const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function formatearNumeroConPuntos(numero) {
  const numStr = numero.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 🧾 Preparar datos del contrato
const data = {
  NUMERO_CONTRATO: input.numero_de_contrato,
  NOMBRE_INMOBILIARIA: input.nombre_inmobiliaria,
  CIUDAD_INMOBILIARIA: input.ciudad_inmobiliaria,
  DEPARTAMENTO_INMOBILIARIA: input.departamento_inmobiliaria,
  NIT_INMOBILIARIA: formatearNumeroConPuntos(input.nit_inmobiliaria),
  NOMBRE_REPRESENTANTE_LEGAL: input.nombre_representante_legal,
  APELLIDO_REPRESENTANTE_LEGAL: input.apellido_representante_legal,
  CEDULA_REPRESENTANTE_LEGAL: formatearNumeroConPuntos(input.cedula_representante_legal),
  CIUDAD_EXPEDICION: input.ciudad_expedicion,
  CORREO: input.correo,
  DIA_NUMEROS: hoy.getDate().toString(),
  DIA_LETRAS: numeroALetrasDia(hoy.getDate()),
  MES: meses[hoy.getMonth()],
  ANO: hoy.getFullYear().toString()
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
      {
        reference: "numeracion7",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "7.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "7.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "7.%1.%2.%3.",
            alignment: AlignmentType.LEFT
          },
        ],
      },
      {
        reference: "numeracion8",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "8.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "8.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "8.%1.%2.%3.",
            alignment: AlignmentType.LEFT
          },
        ],
      },
      {
        reference: "numeracion13",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "13.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "13.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "13.%1.%2.%3.",
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
          top: 1985,     // 3.5 cm
          bottom: 1134,  // 2.0 cm
          left: 1300,    // 2.93 cm (sin cambios)
          right: 1202,   // 2.12 cm (sin cambios)
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
            text: ` persona jurídica debidamente constituida y con domicilio ${UBICACION_GEOGRAFICA}, identificada con el NIT No. ${data.NIT_INMOBILIARIA} representada legalmente por ${data.NOMBRE_REPRESENTANTE_LEGAL} ${data.APELLIDO_REPRESENTANTE_LEGAL} persona mayor de edad, domiciliado y residente en ${data.CIUDAD_INMOBILIARIA}, ${data.DEPARTAMENTO_INMOBILIARIA}, identificado con la cédula de ciudadanía No. ${data.CEDULA_REPRESENTANTE_LEGAL} y quien para todos los efectos legales del presente convenio suministra el correo electrónico ${data.CORREO} y que para los efectos de este convenio se llamará simplemente `,
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
        width: { size: 90, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: [
          new TableRow({
            height: { value: 600, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 60, type: WidthType.PERCENTAGE },
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
            height: { value: 700, rule: HeightRule.EXACT },
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
            height: { value: 700, rule: HeightRule.EXACT },
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
            height: { value: 700, rule: HeightRule.EXACT },
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
            height: { value: 700, rule: HeightRule.EXACT },
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
            height: { value: 1000, rule: HeightRule.EXACT },
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
            height: { value: 1000, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "Preguntas de autenticación", size: 22, font: "Arial MT" }),
                      new TextRun({ text: "(Centrales de Riesgo)", size: 22, font: "Arial MT", break: 1 }),
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
            height: { value: 1000, rule: HeightRule.EXACT },
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

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'QUINTA. FACTURACIÓN:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` La factura por las firmas digitales y los servicios adicionales consumidos se enviará mensualmente a LA INMOBILIARIA con un detalle de los usos realizados. Las tarifas establecidas para la firma digital y para los servicios adicionales se incrementarán anualmente con el incremento del Índice de Precios al Consumidor certificado por el DANE.`,
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
          new TextRun({ text: 'SEXTA. VIGENCIA DEL CONVENIO.', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Doce (12) meses contados a partir de la firma del presente convenio. Este convenio se prorrogará automáticamente anualmente y las tarifas se incrementarán en una proporción igual al aumento del IPC del año inmediatamente anterior.`,
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
          new TextRun({ text: 'SÉPTIMA. CLAUSULA RESOLUTORIA EXPRESA:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Este convenio comercial dejará de tener efectos en los siguientes eventos:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 7.1
      new Paragraph({
        numbering: { reference: "numeracion7", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'En el evento que el CONTRATO DE FIANZA COLECTIVA se termine por cualquiera de las causas señaladas en el contrato celebrado o en REGLAMENTO DE FIANZA dispuesto por AFFI S.A.S.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 7.2
      new Paragraph({
        numbering: { reference: "numeracion7", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Por incumplimiento en los acuerdos comerciales establecidos entre AFFI y ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: '.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 7.3
      new Paragraph({
        numbering: { reference: "numeracion7", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Por decisión unilateral de AFFI comunicada a ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ' con dos meses calendario de anticipación.',
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
          new TextRun({ text: 'OCTAVA. CAPACITACIÓN DE LA PLATAFORMA Y COMPROMISOS DE LA INMOBILIARIA:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` Se procederá a CAPACITAR EN EL USO DE LA PLATAFORMA a los funcionarios de `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: `. Será responsabilidad de LA INMOBILIARIA en forma exclusiva que sus funcionarios acudan a la capacitación y aprendan el correcto manejo de la plataforma. Es preciso señalar que existe en la PLATAFORMA varias formas de VERIFICACION DE LA IDENTIDAD. Para todos los efectos contractuales, en el ARTICULO SEGUNDO de este CONVENIO se ha señalado cuáles deben usar los funcionarios de la INMOBILIARIA frente a los CONTRATOS DE ARRENDAMIENTO que se afianzaran con AFFI S.A.S.`,
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
            text: `Adicionalmente, `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA INMOBILIARIA', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` se compromete a:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 8.1
      new Paragraph({
        numbering: { reference: "numeracion8", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Asignar tiempo de los usuarios que recibirán el entrenamiento necesario para la implementación exitosa.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 8.2
      new Paragraph({
        numbering: { reference: "numeracion8", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Poner a disposición de los usuarios los equipos y elementos necesarios para el correcto funcionamiento de la plataforma.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 8.3
      new Paragraph({
        numbering: { reference: "numeracion8", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Manejar y hacer buen   uso de   la   cuenta    de    usuario    suministrada por AFFI S.A.S. ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ' no permitirá su utilización por parte de terceras personas.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 8.4
      new Paragraph({
        numbering: { reference: "numeracion8", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Utilizar la plataforma conforme a las estipulaciones previstas en el presente acuerdo y los demás términos y condiciones, y políticas establecidas por parte de AUTENTIC SIGN que le serán entregadas a ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ' por parte de AFFI S.A.S.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 8.5
      new Paragraph({
        numbering: { reference: "numeracion8", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Responder por todos los perjuicios que pueda causar a AUTENTIC SIGN o a terceros derivados del uso inadecuado de la cuenta de usuario y mantendrá indemne a AUTENTIC SIGN frente a cualquier reclamación que se presente con ocasión de dichos actos.',
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
          new TextRun({ text: 'NOVENA. EMISION DE CERTIFICADO DE FIRMA DIGITAL:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` En el evento en que `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` requiera la emisión de un certificado de firma digital, independientemente de su duración, dicho certificado será emitido por la entidad de  certificación digital abierta debidamente autorizada en Colombia para la emisión de este tipo de certificados y acreditada por parte del Organismo Nacional de Acreditación de Colombia - ONAC con la cual AUTENTIC SIGN tenga convenio al costo que cause la entidad de certificación digital.`,
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
          new TextRun({ text: 'DÉCIMA. RESPONSABILIDAD DE AFFI S.A.S:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` AFFI S.A.S. permitirá el uso de la PLATAFORMA que ha adquirido de AUTENTIC SIGN y ese es su UNICO COMPROMISO Y OBLIGACION en este CONVENIO. Por lo tanto y si la PLATAFORMA tiene deficiencias o errores, esta será responsabilidad de AUTENTIC SIGN y cualquier reclamo sobre el particular deberá hacerse a dicha entidad por intermedio de AFFI S.A.S.`,
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
          new TextRun({ text: 'DÉCIMA PRIMERA SOPORTE TECNICO:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` El servicio de soporte técnico se prestará durante la vigencia del convenio por parte de AUTENTIC SIGN. El soporte técnico será prestado única y exclusivamente en asuntos relacionados con la funcionalidad de AUTENTIC SIGN. El soporte no cubre la solución de asuntos relacionados con fallas en los equipos, fallas de conexión a internet, y en general, asuntos no relacionados con la programación de AUTENTIC SIGN. `,
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
          new TextRun({ text: 'DÉCIMA SEGUNDA. TITULARIDAD / PROPIEDAD INTELECTUAL:', bold: true, font: 'Arial MT', size: 22, color: '000000', underline: true }),
          new TextRun({
            text: ` LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` no adquirirá la propiedad sobre AUTENTIC SIGN, ni cualquier otro software de propiedad de AUTENTIC SIGN y no podrá utilizarlo para fines distintos a los previstos en el presente convenio. LA INMOBILIARIA reconoce que AUTENTIC SIGN es el único titular de derechos de autor sobre AUTENTIC SIGN. Así mismo, AFFI S.A.S. reconoce que la titularidad de los derechos de autor sobre la información y los contenidos generados y/o registrados por `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` (a través de sus Usuarios) dentro de AUTENTIC SIGN pertenece de forma exclusiva a `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: `.`,
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
            text: `Queda claro para `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` que AFFI S.A.S. le está permitiendo el uso de la PLATAFORMA AUTENTIC SIGN, pero que AUTENTIC SIGN ostenta y conservará todos los derechos de propiedad intelectual, industrial o cualesquiera otros; AUTENTIC SIGN no podrá ser objeto de modificación, copia, alteración, reproducción, adaptación o traducción por parte de `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` (incluidos los Usuarios). La estructura, características, códigos, métodos de trabajo, sistemas de información, herramientas de desarrollo, know-how, metodologías, procesos, tecnologías o algoritmos de AUTENTIC SIGN son propiedad protegida, incluidos aquellos que se desarrollen en la etapa de implementación (programación), y están regulados por las normas colombianas e internacionales de propiedad intelectual e industrial.`,
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
            text: `En consecuencia, queda terminantemente prohibido cualquier uso por `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: `LA INMOBILIARIA`,
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ` de AUTENTIC SIGN que se realice sin la autorización expresa y por escrito de AFFI S.A.S. Y/O AUTENTIC SIGN, incluida su explotación, reproducción, difusión, transformación, distribución, transmisión por cualquier medio, posterior publicación, exhibición, comunicación pública o representación total o parcial, las cuales, de producirse, constituirán infracciones de los derechos de propiedad intelectual o industrial de AUTENTIC SIGN, sancionadas por la legislación vigente.`,
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
            text: `DÉCIMA TERCERA. EXONERACIÓN DE RESPONSABILIDAD:`,
            font: 'Arial MT',
            size: 22,
            underline: true,
            bold: true
          }),
          new TextRun({
            text: ` AFFI S.A.S. e igualmente, AUTENTIC SIGN no serán en ningún caso responsables por:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 13.1
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'El uso indebido de la cuenta de usuario por parte de ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: ' o de terceros, ni responderá por sanciones y gastos derivados de reclamaciones de las personas afectadas, por negligencia y/o falta de confidencialidad, uso y/o tratamientos indebidos de los datos de carácter personal, incluyendo expresamente cualesquiera importes derivados de las sanciones que, eventualmente, pudiera imponerle la autoridad competente en materia de protección de datos por el incumplimiento o cumplimiento defectuoso de la normativa aplicable en la materia.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 13.2
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'La suspensión de AUTENTIC SIGN originada en fallas técnicas u operativas ajenas a su voluntad, ni de aquellas que escapen de su control tales como cortes de energía eléctrica, fallas en los equipos de ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ', fallas en la conexión a internet, o en general por eventos de fuerza mayor o caso fortuito.',
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 13.3
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Los errores de funcionamiento o de los daños provocados por el incumplimiento de las obligaciones de ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ' que le sean de aplicación de conformidad con lo previsto en los presentes términos.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 13.4
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Cualquier daño o perjuicio que pueda ser ocasionado a ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ' como consecuencia de un ataque cibernético al repositorio de información administrado por AUTENTIC SIGN o a la plataforma AUTENTIC SIGN, cuando dicho ataque haya sido generado (i) por un incumplimiento a las obligaciones de ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: ', (ii) un uso indebido de la cuenta de usuario; (iii) cuando el ataque se genere sobre información contenida en bases de datos que se encuentran en repositorios administrados por LA INMOBILIARIA, toda vez que AUTENTIC SIGN no puede garantizar condiciones de seguridad sobre estos repositorios o; iv) por eventos de fuerza mayor o caso fortuito.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 13.5
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Cualquier daño o perjuicio que pueda ser calificado como lucro cesante, pérdida de negocios, daño a la imagen o pérdida de reputación comercial de ',
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({
            text: 'LA INMOBILIARIA',
            font: 'Arial MT',
            size: 22,
            bold: true
          }),
          new TextRun({
            text: '.',
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 13.6
      new Paragraph({
        numbering: { reference: "numeracion13", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Retrasos, fallos de entrega u otros daños provocados por problemas inherentes al uso de Internet, pues el correcto funcionamiento de AUTENTIC SIGN puede estar sujeto a limitaciones, retrasos y otros problemas inherentes a Internet y las comunicaciones electrónicas.',
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
          new TextRun({
            text: `En señal de conformidad se suscribe el presente documento en la ciudad de Cali el día ${data.DIA_LETRAS} (${data.DIA_NUMEROS}) ${data.MES} de ${data.ANO}.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        children: [
          new TextRun({ break: 4 }),
        ]
      }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: "NONE", size: 0, color: "FFFFFF" },
          bottom: { style: "NONE", size: 0, color: "FFFFFF" },
          left: { style: "NONE", size: 0, color: "FFFFFF" },
          right: { style: "NONE", size: 0, color: "FFFFFF" },
          insideHorizontal: { style: "NONE", size: 0, color: "FFFFFF" },
          insideVertical: { style: "NONE", size: 0, color: "FFFFFF" }
        },
        rows: [
          // 🔹 Fila 1: César + Representante Inmobiliaria
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ children: [ new TextRun({ text: "CESAR AUGUSTO TEZNA CASTAÑO", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "C.C. 94.492.994", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "Representante legal", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "AFFI S.A.S.", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "NIT. 900.053.370", font: "Arial MT", size: 22 }) ] })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ children: [ new TextRun({ text: `${data.NOMBRE_REPRESENTANTE_LEGAL} ${data.APELLIDO_REPRESENTANTE_LEGAL}`, font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: `C.C. No ${data.CEDULA_REPRESENTANTE_LEGAL}`, font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "Representante legal", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: data.NOMBRE_INMOBILIARIA, font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: `NIT. ${data.NIT_INMOBILIARIA}`, font: "Arial MT", size: 22 }) ] })
                ]
              })
            ]
          }),

          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2, // une las dos columnas
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ break: 3 }),
                    ],
                  })
                ],
                verticalAlign: VerticalAlign.CENTER,
                height: { value: 400, rule: HeightRule.EXACT } // altura fija
              })
            ]
          }),

          // 🔹 Fila 2: Lilian + Angelica
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ children: [ new TextRun({ text: "LILIAN PAOLA HOLGUÍN ORREGO", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "C.C. 1.112.956.229", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "Gerente Comercial", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "AFFI S.A.S.", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "NIT. 900.053.370", font: "Arial MT", size: 22 }) ] })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ children: [ new TextRun({ text: "ANGELICA OSSA", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "C.C. 1.115.075.655", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "Gerente Financiera", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "AFFI S.A.S.", font: "Arial MT", size: 22 }) ] }),
                  new Paragraph({ children: [ new TextRun({ text: "NIT. 900.053.370", font: "Arial MT", size: 22 }) ] })
                ]
              })
            ]
          })
        ]
      })
    ]
  }]
});


// 💾 Guardar el archivo
Packer.toBuffer(doc).then(buffer => {
  writeFileSync("src/contratos/CONVENIO_FIRMA_DIGITAL.docx", buffer);
  console.log("✅ Convenio juridico generado con éxito");
});
