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
  PageNumber
} from "docx";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaJSON = path.resolve(__dirname, "datosTemp.json");

const raw = readFileSync(rutaJSON, "utf-8");
const input = JSON.parse(raw);

// 📌 Función para convertir día a letras
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

// 🧾 Datos del contrato para persona natural
const data = {
  NUMERO_CONTRATO: input.numero_de_contrato,
  NOMBRE_CLIENTE_NATURAL: input.nombre_cliente_natural,
  CEDULA_CLIENTE_NATURAL: input.cedula_cliente_natural,
  CIUDAD_EXPEDICION_CLIENTE: input.ciudad_expedicion_cliente,
  CIUDAD_RESIDENCIA_CLIENTE: input.ciudad_residencia_cliente,
  DIRECCION_CLIENTE: input.direccion_cliente,
  TELEFONO_CLIENTE: input.telefono_cliente,
  CORREO_CLIENTE: input.correo_cliente,
  DIA_NUMEROS: hoy.getDate().toString(),
  DIA_LETRAS: numeroALetrasDia(hoy.getDate()),
  MES: meses[hoy.getMonth()],
  ANO: hoy.getFullYear().toString()
};

// 🔠 Convertir todo a mayúsculas
Object.keys(data).forEach(key => {
  if (typeof data[key] === "string") {
    data[key] = data[key].toUpperCase();
  }
});

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
        reference: "numeracion17",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "17.%1.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 1,
            format: "decimal",
            text: "17.%1.%2.",
            alignment: AlignmentType.LEFT
          },
          {
            level: 2,
            format: "decimal",
            text: "17.%1.%2.%3.",
            alignment: AlignmentType.LEFT
          },
        ]
      }
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
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: "Times New Roman",
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
            text: `CONTRATO DE FIANZA COLECTIVA No. ${data.NUMERO_CONTRATO}`,
            bold: true,
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        style: "Heading1",
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 0, line: 480 },
        children: [
          new TextRun({
            text: 'IDENTIFICACION DE LAS PARTES',
            bold: true,
            font: 'Arial MT',
            size: 22,
            color: '000000'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'AFFI S.A.S. sociedad legalmente constituida mediante escritura pública No. 2791 del 14 de octubre de 2005, otorgada en la Notaría 15 del Círculo de Cali, debidamente registrada en la Cámara de Comercio de esta ciudad el pasado 03 de noviembre de 2005, bajo el No. 12392 del libro IX, con domicilio principal en la ciudad de Cali, representada legalmente por CESAR AUGUSTO TEZNA CASTAÑO, persona mayor de edad, domiciliada y residente en Cali, identiﬁcada con la C.C. No. 94.492.994 expedida en Cali, entidad que en lo sucesivo se denominará LA AFIANZADORA.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: data.NOMBRE_INMOBILIARIA, bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` sociedad legalmente constituida con domicilio en la ciudad de ${data.CIUDAD_INMOBILIARIA} bajo el NIT No ${data.NIT_INMOBILIARIA} representada en este acto por ${data.NOMBRE_REPRESENTANTE_LEGAL} identificado con la CC No ${data.CEDULA_REPRESENTANTE_LEGAL} de ${data.CIUDAD_EXPEDICION} en su calidad de Representante Legal existencia y representación que se acredita con certificación expedida por la Cámara de Comercio de ${data.CIUDAD_INMOBILIARIA}, la cual se adjunta y hace parte integral de este contrato y que para todos los efectos se denominará `,
            font: 'Arial MT',
            size: 22
          }),
          new TextRun({ text: 'LA SOCIEDAD INMOBILIARIA', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({ text: '.', font: 'Arial MT', size: 22 }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        style: "Heading1", 
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'IDENTIFICACION DE TERCEROS AFIANZADOS. -',
            bold: true,
            font: 'Arial MT',
            size: 22,
            color: '000000'
          }),
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: 'Se entenderán como terceros en este contrato todas las personas naturales o jurídicas que tengan la condición de ARRENDATARIOS y consecuentes DEUDORES de LA SOCIEDAD INMOBILIARIA, por concepto de todas las obligaciones derivadas de los contratos de arrendamiento que son objeto del presente contrato de ﬁanza. Cada vez que LA SOCIEDAD INMOBILIARIA ingrese nuevos contratos al CONTRATO DE FIANZA COLECTIVO mediante los medios electrónicos que para tal hecho disponga AFFI S.A.S., estos contratos se regirán por este contrato de fianza, el acta de resultados y el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S. vigente para ese momento y comunicado a LA SOCIEDAD INMOBILIARIA. Y esos terceros que se incluyan en dicho contrato de arrendamiento serán los afianzados por AFFI S.A.S.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: 'Entre las partes arriba indicadas, LA AFIANZADORA y la SOCIEDAD INMOBILIARIA hemos convenido en celebrar el presente CONTRATO DE FIANZA COLECTIVA el cual se regirá por las cláusulas que a continuación se expresan y en lo no regulado en ellas, por el Reglamento de Condiciones Generales del Servicio de Fianza, documento que hace parte integral del presente contrato, y por la legislación comercial vigente para este tipo de contratos.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'PRIMERA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Objeto. - LA AFIANZADORA se compromete para con LA SOCIEDAD INMOBILIARIA a garantizar las obligaciones derivadas de los contratos de arrendamiento suscritos por LA SOCIEDAD INMOBILIARIA en su condición de ARRENDADORA y las personas naturales y/o jurídicas que adquieran en virtud de dichos contratos de arrendamiento la condición de ARRENDATARIOS DEUDORES, previo el estudio jurídico efectuado por LA AFIANZADORA y el ACTA DE RESULTADO que se obtenga en cada caso, documento que hace parte integral del presente contrato.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'PARAGRAFO:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` La Junta Directiva de la AFIANZADORA procederá a aprobar el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S. que hará parte integral del presente contrato y que se comunicará por cualquier medio a LA SOCIEDAD INMOBILIARIA. El Reglamento que esté vigente para el momento del aviso del incumplimiento será el que regule las relaciones entre ARRENDADORA, ARRENDATARIO, DEUDORES SOLIDARIOS y AFIANZADORA.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'SEGUNDA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Limitación de la Fianza. - La limitación de la ﬁanza del presente contrato se sujetará a lo establecido en el ACTA DE RESULTADO o hasta tanto se obtenga la restitución real y material del inmueble, en todo caso se establece que tanto para inmuebles destinados para VIVIENDA cómo comercial no podrá exceder los TREINTA Y SEIS (36) MESES consecutivos contados a partir del momento del aviso de incumplimiento.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'PARAGRAFO PRIMERO:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Una vez notiﬁcada por parte de LA AFIANZADORA a LA SOCIEDAD INMOBILIARIA, el resultado de la Revisión Jurídica de los Modelos de Contrato, LA SOCIEDAD INMOBILIARIA ACREEDORA se compromete y acepta desde ahora a efectuar los ajustes jurídicos al contrato de arrendamiento, de conformidad con las solicitudes contenidas en el Concepto Jurídico emitido por LA AFIANZADORA, el cual hace parte integral del contrato de FIANZA COLECTIVA, para que los contratos de arrendamiento cumplan con las exigencias de aﬁanzamiento y se hace responsable de que este texto, sea utilizado en desarrollo de su actividad comercial.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: `No obstante, si una vez reportado el incumplimiento por parte de la INMOBILIARIA ARRENDADORA, se determina que el contrato de arrendamiento no cumple con las exigencias mínimas para su aﬁanzamiento por no haberse incluido las recomendaciones jurídicas que AFFI S.A.S. en su momento le señaló o por no tener los contratos actualizados según las leyes vigentes y no es posible adelantar el cobro por la vía judicial o que una vez iniciado y por no acatar esas recomendaciones el Juez niega las pretensiones del ARRENDADOR y/o AFIANZADORA, LA INMOBILIARIA ARRENDADORA procederá al reintegro de los valores pagados hasta la fecha a AFFI S.A.S. y se excluirá ese contrato de arrendamiento del CONTRATO DE FIANZA y si así lo dispone LA SOCIEDAD INMOBILIARIA ACREEDORA, la gestión de cobro continuará por AFFI S.A.S. como recuperación, pero sin responsabilidad alguna de su parte.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'TERCERA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Lugar de ejecución. - Las partes acuerdan que las obligaciones garantizadas serán aquellas que se deriven de los contratos de arrendamientos de los inmuebles ubicados en la ciudad de ${data.CIUDAD_INMOBILIARIA}, lo que no signiﬁca que la cobertura no pueda ampliarse a otras ciudades siempre y cuando así se pacte por escrito.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'CUARTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Duración del presente contrato. - La vigencia del presente contrato de FIANZA COLECTIVA será indeﬁnida mientras subsistan las causas que le dieron origen y no exista un común acuerdo entre las partes de darlo por terminado o no concurra una de las justas causas para tal efecto. No obstante lo anterior y para la vigencia de la ﬁanza frente a cada contrato de arrendamiento en particular, esta se encuentra limitada por la duración de dicho contrato de arrendamiento, al cabo del cual cesa la responsabilidad de LA AFIANZADORA por este contrato, pero respaldando todas la obligaciones que antes de dicha fecha haya adquirido el arrendatario deudor, todo de conformidad a las normas, procedimientos y condiciones establecidos en el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S. vigente para el momento en que ocurra el hecho.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: `De igual manera, si en determinado contrato de arrendamiento que se encuentra vigente, no se cumple con lo establecido en el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA DE AFFI S.A.S. igualmente cesará la ﬁanza frente a las obligaciones derivadas de dicho contrato sin que ello implique terminación de la ﬁanza Colectiva y relacionada con los demás contratos de arrendamiento que si cumplan con el reglamento del servicio de AFFI S.A.S. Para el efecto AFFI S.A.S. notificará a la INMOBILIARIA las razones por las cuales es excluido el contrato de arrendamiento de la FIANZA COLECTIVA y a partir de qué fecha es esa exclusión. Sobre los restantes contratos, seguirá vigente el CONTRATO DE FIANZA.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'QUINTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Prohibición especial a LA SOCIEDAD INMOBILIARIA.- Las partes acuerdan establecer como una prohibición especial para LA SOCIEDAD INMOBILIARIA, el recibir pagos, otorgar plazos, efectuar condonaciones o descuentos, acudir a procesos de regulación de renta, acudir a audiencias de conciliación en Juzgados o Centros de Conciliación, celebrar reuniones y llegar a acuerdos de cualquier tipo con LOS DEUDORES ARRENDATARIOS que ya hayan sido reportados como morosos ante LA AFIANZADORA, sin la previa autorización de ésta, de tal suerte que cualquier arreglo extraprocesal y/o procesal es de competencia exclusiva y de conocimiento de LA AFIANZADORA.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: `En el evento de que los inquilinos efectúen pagos directamente a LA SOCIEDAD INMOBILIARIA, estando el contrato reportado a LA AFIANZADORA esta se compromete a reintegrar a AFFI S.A.S., la totalidad de las sumas recibidas inmediatamente sin perjuicio del cobro por parte de LA AFIANZADORA de las sanciones establecidas por este concepto en el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: `La violación a esta cláusula por parte de LA SOCIEDAD INMOBILIARIA dará lugar a la cesación de la responsabilidad de LA AFIANZADORA frente a las obligaciones derivadas de dicho contrato de arrendamiento, así como también frente a las consecuencias jurídicas negativas que la conducta de LA SOCIEDAD INMOBILIARIA cause en el respectivo proceso ejecutivo y/o de restitución instaurado. De ser reiterativa esta violación, LA AFIANZADORA podrá dar por terminado unilateralmente este vínculo contractual de FIANZA COLECTIVA frente a todos los contratos objeto de la misma, con la correspondiente indemnización de perjuicios.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'SEXTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Obligaciones civiles garantizadas.- Mediante el presente contrato de ﬁanza Colectiva, LA AFIANZADORA garantizará a LA SOCIEDAD INMOBILIARIA, el pago de las obligaciones de naturaleza civil derivadas de los contratos de arrendamiento vigentes, tanto en la línea principal (cánones de arrendamiento), como en la secundaria (administración, IVA, amparo integral, servicios públicos), según lo establecido en el REGLAMENTO DE CONDICIONES GENERALES DEL SERVICIO DE FIANZA, que no hayan sido cubiertas por los arrendatarios previamente aprobados por LA AFIANZADORA, y que se deriven del respectivo contrato de arrendamiento, tales como cánones de arrendamiento, servicios públicos, daños y faltantes e IVA (Amparo Integral) y cuotas de administración, teniendo como soporte para instaurar las respectivas acciones el contrato de arrendamiento y/o los títulos valores que los arrendatarios hayan entregado a LA SOCIEDAD INMOBILIARIA. Están por fuera de esta ﬁanza cualquier tipo de obligación de carácter natural.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'PARAGRAFO PRIMERO:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Se deja expresa constancia que es requisito indispensable que los contratos de arrendamiento de los cuales se derivan las obligaciones aquí garantizadas, presten mérito ejecutivo y contengan las renuncias expresas de requerimientos de ley por parte de los arrendatarios, de tal suerte que LA AFIANZADORA pueda ejercer las acciones ejecutivas y procesos de restitución pertinentes en contra de los mismos teniendo como título ejecutivo el respectivo contrato de arrendamiento. Por lo tanto, se deben hacer llegar a la AFIANZADORA la totalidad de documentos originales del contrato y las cesiones debidamente notificadas a todas las partes.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'SEPTIMA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` CLAUSULA DE EXCLUSION: Ante un hecho o circunstancia imprevisible al momento de la celebración del contrato cuyos efectos no pudieren ser evitados o superados por las partes, imposibilitando el cumplimiento de una o más obligaciones contractuales, quedará la afianzadora eximida de cumplir sus obligaciones en virtud del Contrato y de cualquier responsabilidad por daños y perjuicios o de cualquier otra penalización contractual por incumplimiento del contrato. La excepción de responsabilidad surtirá efectos a partir de la notificación de la aplicación de esta cláusula.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'OCTAVA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' Honorarios y forma de pago. - Las partes acuerdan establecer por concepto de honorarios correspondientes al servicio de fianza los siguientes porcentajes, dependiendo de las obligaciones afianzadas y el respectivo amparo, así:',
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Para el afianzamiento de cánones de arrendamiento la tarifa aplicable sobre el monto a afianzar será del ${data.TARIFA_SEGUN_ZONA} más IVA para contratos celebrados en la ciudad ${data.CIUDAD_INMOBILIARIA}.`,
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
            text: 'La fianza de Amparo Integral que incluye los Servicios Públicos y los Daños y Faltantes tendrá un costo del 10.34% más IVA del valor solicitado para afianzar (mínimo $1.000.000 máximo $12.000.000), la cual tiene vigencia hasta la finalización del contrato de arrendamiento.',
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
            text: 'El costo de la fianza de las cuotas de administración será el mismo establecido para los arrendamientos en esta cláusula. El valor afianzado podrá ser reajustado anualmente de acuerdo con lo establecido por la respectiva Asamblea de Copropietarios y el nuevo valor será afianzado a partir del momento de la notificación a LA AFIANZADORA. Si en la SOLICITUD DE INGRESO no se relaciona por separado el monto de la administración a afianzar, se entenderá como no cubierta por la fianza.',
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
            text: 'El costo de la fianza de Servicios Públicos será del 8.62% más IVA del valor solicitado para afianzar (mínimo $500.000 máximo $12.000.000), la cual tiene vigencia hasta la finalización del contrato de arrendamiento.',
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
          new TextRun({ text: 'PARAGRAFO:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Los valores aquí establecidos serán cancelados por LA SOCIEDAD INMOBILIARIA de acuerdo a lo descrito en el Reglamento de Condiciones Generales del Servicio de Fianza en su artículo 7.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'NOVENA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Obligaciones de las partes. - Las partes del presente contrato de ﬁanza se comprometen a cumplir con todas las obligaciones por la condición que adquieren al suscribir este contrato, la ley les impone y adicionalmente con las derivadas de las condiciones generales del servicio de ﬁanza que obran en el respectivo documento el cual hace parte integral del presente contrato.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'DECIMA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Causales de extinción. - El presente contrato de ﬁanza inmobiliaria, se tendrá por extinguido en los siguientes casos:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Cuando exista mutuo acuerdo entre las partes el cual conste en documento suscrito por ellas y al que se le debe anexar el respectivo y recíproco paz y salvo.`,
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
            text: 'Por incumplimiento de las obligaciones legales y las pactadas en el documento de condiciones generales del servicio de ﬁanza.',
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
            text: 'Por disolución, liquidación y cancelación de la personería jurídica de LA SOCIEDAD INMOBILIARIA.',
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
            text: 'Por las demás causales consagradas en la ley y en las condiciones generales del servicio de ﬁanza.',
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
            text: 'Por el incumplimiento de los requisitos exigidos a LA SOCIEDAD INMOBILIARIA.',
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
            text: 'Las demás causales que se contemplen en el reglamento de condiciones, documento integral del presente contrato.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({
        pageBreakBefore: true,
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'DECIMA PRIMERA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Instauración procesos de restitución.- Dentro del contrato de ﬁanza se compromete LA AFIANZADORA a instaurar las respectivas acciones de restitución de los inmuebles arrendados a nombre y representación de LA SOCIEDAD INMOBILIARIA como arrendadora del bien, siempre y cuando exista incumplimiento del contrato de arrendamiento imputable al arrendatario y no al arrendador, para lo cual LA SOCIEDAD INMOBILIARIA deberá cumplir a cabalidad con todas las obligaciones que su condición de demandante le imponga, como por ejemplo conferir poder a los abogados de LA AFIANZADORA, entregar la documentación requerida de manera oportuna, entre otros.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'DECIMA SEGUNDA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Requisitos de las inmobiliarias aﬁanzadas. - LA AFIANZADORA concederá el servicio de ﬁanza a las Inmobiliarias que cumplan con los siguientes requisitos:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Estar legalmente constituidas como administradoras inmobiliarias para lo cual deberán aportar certiﬁcado de Existencia y Representación Legal de la Cámara de Comercio de la ciudad, fotocopia de la cédula de ciudadanía del Representante Legal y copia de Matrícula de Arrendador otorgada por la autoridad competente.`,
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
            text: 'La sociedad inmobiliaria se compromete a aﬁanzar en el primer trimestre y mantener durante el tiempo que se sostenga relaciones comerciales con LA AFIANZADORA, un mínimo de diez (10) contratos.',
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
            text: 'Cumplir con el diligenciamiento de los datos según indique LA AFIANZADORA para poder ingresar al sistema como usuarios de la ﬁanza.',
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
            text: 'Suscribir la carta de compromiso en la cual maniﬁeste que conocen y acepta las condiciones establecidas en el presente contrato y sus adeudos (reglamento).',
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
            text: 'Asistir a las reuniones de inducción y capacitación que sean programadas para dar a conocer los formatos, el presente reglamento y demás documentos relativos a la ﬁanza.',
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
            text: 'Los demás que la Asamblea, la Junta Directiva y los otros órganos de dirección establezcan, los cuales serán comunicados por escrito a los usuarios y clientes potenciales.',
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
          new TextRun({ text: 'DECIMA TERCERA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Solución de conﬂictos. - Cualquier conﬂicto entre las partes aquí ﬁrmantes y que se derive de la ejecución del presente contrato deberá ser sometido a conciliación ante un centro de conciliación reconocido legalmente como tal previo al agotamiento de las acciones judiciales pertinentes.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'DECIMA CUARTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Autorización.- En virtud del presente contrato, el Representante Legal de LA SOCIEDAD INMOBILIARIA maniﬁesta que es su voluntad inequívoca y libre de cualquier presión, autorizar de manera previa, expresa e irrevocable a LA AFIANZADORA y a su eventual cesionario o subrogatorio para incorporar, reportar, procesar y consultar en bancos de datos, la información que se relacione con este contrato o que de él se derive, así mismo autoriza para que los contacten y notiﬁquen a través de los datos que aportan en este documento, la solicitud de ﬁanza y a los que llegaran a encontrar a futuro, comprometiéndose a actualizar los mismos en caso de cambio de domicilio o lugar de trabajo siempre y cuando exista el vínculo contractual que dio origen a la autorización de consulta y reporte.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'PARAGRAFO PRIMERO:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` La presente autorización la extiende el Representante Legal de LA SOCIEDAD INMOBILIARIA ACREEDORA, en los mismos términos y con los mismos alcances aquí indicados para el cobro extraprocesal y/o procesal de las obligaciones derivadas del Contrato de Fianza Colectiva, cuando a ello hubiere lugar.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'DECIMA QUINTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Documentos anexos al presente contrato. - Hacen parte integral del presente contrato, los siguientes documentos:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: `Certiﬁcado de existencia y representación legal de LA AFIANZADORA.`,
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
            text: 'Certiﬁcadode existencia y representación legal de LA SOCIEDAD INMOBILIARIA.',
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
            text: 'Reglamento de Condiciones Generales del Contrato de Fianza.',
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
            text: 'Resultado de la revisión jurídica de los modelos de contrato - Concepto Jurídico.',
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
            text: 'Contratos de arrendamiento aﬁanzados, documentos que se van incorporando a medida que se reporten las obligaciones en mora.',
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
            text: 'Formatos de Reporte de Novedades: Todas aquellas modiﬁcaciones al presente contrato que obren en documento separado.',
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
          new TextRun({ text: 'DECIMA SEXTA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` Acuerdo de conﬁdencialidad. - Toda información que las partes compartan durante la ejecución del contrato de ﬁanza colectiva deberá ser mantenida de una manera conﬁdencial y solo podrá ser utilizada para los objetivos del Acuerdo y de ninguna manera la información conﬁdencial podrá ser revelada, divulgada, exhibida, mostrada, comunicada, utilizada y/o empleada para la realización de negocios ajenos a lo estipulado en el texto de este Acuerdo. A los efectos establecidos en este documento, cada una de las Partes se obliga a mantener la información de manera conﬁdencial y privada y a proteger dicha información para evitar su divulgación no autorizada, ejerciendo sobre la misma el mismo grado de diligencia que utiliza para proteger información conﬁdencial de su propiedad y el que impone las leyes y normas profesionales aplicables. Las Partes advertirán a los destinatarios de la información conﬁdencial sobre su carácter conﬁdencial, y les darán a conocer este compromiso, de manera que se cumpla tanto por quienes la reciban directamente, como parte de sus empleados, trabajadores o asesores jurídicos.`,
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
            text: `Las partes maniﬁestan entender y aceptar que para el desarrollo de la relación comercial es necesario e indispensable revelar cierta información conﬁdencial a terceros, tales como: empleados, compañías de seguros, asesores jurídicos, y contratistas que deban conocer dicha información para ejecutar la relación comercial, quienes serán, para los efectos de este Acuerdo, los destinatarios de la información conﬁdencial.`,
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
            text: `Las obligaciones de conﬁdencialidad consagradas en el presente acuerdo tienen una vigencia que estará limitada por la duración del contrato de ﬁanza colectiva.`,
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
          new TextRun({ text: 'DECIMO SEPTIMA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` REGULACION DE LA FUERZA MAYOR POR LAS PARTES: Para todos los efectos del presente contrato, además de la regulación legal existente en el Código Civil y el Código de Comercio, las partes han acordado la presente regulación de la FUERZA MAYOR que será ley para las partes conforme al artículo 1602 del Código Civil y que prevalecerá sobre las normas legales vigentes.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({}),

      // 17.1
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'DEFINICIÓN. ', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: '“Fuerza mayor” significa la producción de un hecho o circunstancia (“Caso de Fuerza Mayor”) que imposibilita o impide que una parte cumpla una o más de sus obligaciones contractuales de acuerdo con el contrato, en la medida en que la parte afectada por el impedimento ("la Parte Afectada") pruebe:',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.1.1
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Que dicho impedimento está fuera de su control razonable;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.1.2
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Que no podría haberse previsto razonablemente en el momento de la celebración del contrato;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.1.3
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Que los efectos del impedimento no podrían razonablemente haber sido evitados o superados por la Parte Afectada.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.2
      new Paragraph({
        pageBreakBefore: true,
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'INCUMPLIMIENTO POR PARTE DE TERCEROS. ', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: 'Cuando una parte contratante incumpla una o varias de sus obligaciones contractuales a causa del incumplimiento de un tercero que se ha comprometido a ejecutar total o parcialmente el contrato, la parte contratante podrá invocar la Fuerza Mayor solo en la medida en que los tres requisitos del numeral 17.1. de esta Cláusula se cumplan tanto para la parte contratante como para el tercero.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'CASOS PRESUNTOS DE FUERZA MAYOR. ', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: 'Salvo prueba en contrario, se presumirá que los siguientes hechos que afecten a una parte cumplen las condiciones 17.1.1. y 17.1.2. de esta Cláusula, y la Parte Afectada solo necesitará probar que se cumple la condición 17.1.3.:',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.1
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Guerra (ya esté declarada o no), hostilidades, invasión, actos de enemigos extranjeros, amplia movilización militar;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.2
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Guerra civil, disturbios, rebelión y revolución, usurpación -militar o no- del poder, insurrección, actos de terrorismo, sabotaje o piratería;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.3
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Restricciones monetarias y comerciales, embargo o sanción sobre la economía en General o sobre la actividad económica en particular en la Nación, Departamento, Municipio o Comuna que recaiga expresamente sobre la actividad que desarrolla la parte afectada.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.4
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Acto de una autoridad pública, ya sea legal o ilegal, cumplimiento de cualquier ley u orden gubernamental, expropiación, ocupación de obras, requisa, nacionalización;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.5
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Plaga, epidemia, desastre o evento natural extremo;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.6
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Explosión, incendio, destrucción de equipos, interrupción prolongada del transporte, telecomunicaciones, sistemas de información o energía;',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.7
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Disturbios laborales generales en la Nación, Departamento o Municipio tales como boicot, huelga y cierre patronal, ocupación de fábricas y locales que impiden la ejecución normal de la actividad económica de la Parte Afectada.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.3.8
      new Paragraph({
        numbering: { reference: "numeracion17", level: 1 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Situación económica en la Nación, Departamento o Municipio de tal magnitud y que era imprevisible de prever al tiempo de la celebración del contrato que modifica el equilibrio económico del mismo y la imposibilidad de ejecución de las obligaciones adquiridas.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.4
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'NOTIFICACIÓN.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' La Parte Afectada deberá notificar el hecho que constituye FUERZA MAYOR sin demora a la otra parte y al menos dentro de los diez (10) días calendario a la fecha en que tal hecho ocurrió. A la notificación le deberá acompañar las pruebas que lo acreditan y las razones por las cuales la parte afectada considera que se ha presentado un evento de FUERZA MAYOR.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.5
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'CONSECUENCIAS DE LA FUERZA MAYOR.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' La parte que invoque con éxito esta Cláusula quedará eximida de su deber de cumplir sus obligaciones en virtud del Contrato y de cualquier responsabilidad por daños y perjuicios o de cualquier otra penalización contractual por incumplimiento del contrato, desde el momento en que el impedimento haya provocado la incapacidad para cumplirlo, siempre que se notifique de ello sin demora y en la forma establecida en el numeral 17.4. Si la notificación no se efectúa sin demora, la exención de responsabilidad será efectiva desde el momento en que la notificación llegue a la otra parte. La otra parte podrá suspender el cumplimiento de sus obligaciones, si procede, a partir de la fecha de la notificación.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.6
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'IMPEDIMENTO TEMPORAL.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' Cuando el efecto del impedimento o hecho invocado sea temporal, las consecuencias establecidas en el numeral 17.5. se aplicarán solo mientras el impedimento invocado impida el cumplimiento por la Parte Afectada de sus obligaciones contractuales. La Parte Afectada deberá notificar a la otra parte la desaparición del impedimento tan pronto como éste deje de obstaculizar el cumplimiento de sus obligaciones contractuales.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.7
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'DEBER DE LIMITAR LOS EFECTOS.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' La Parte Afectada tiene la obligación de tomar todas las medidas razonables para limitar el efecto del hecho impeditivo invocado y relativo al cumplimiento del contrato.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.8
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'TERMINACION DEL CONTRATO.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' Cuando la duración del impedimento invocado tenga el efecto de privar sustancialmente a las partes contratantes de lo que razonablemente tenían derecho a esperar en virtud del contrato, cualquiera de las partes tendrá derecho a dar por terminado el contrato mediante una notificación dirigida a la otra parte con un preaviso razonable de treinta (30) días calendario. Salvo acuerdo en contrario, las partes acuerdan expresamente que el contrato podrá ser terminado por cualquiera de ellas si la duración del impedimento excede de 120 días calendario contados a partir de la notificación del hecho conforme al numeral 17.4.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.9
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'ENRIQUECIMIENTO INJUSTO.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' Cuando resulte de aplicación la terminación del contrato en virtud de lo acordado en el numeral 17.8., si cualquiera de las partes contratantes, debido acualquier actuación de la otra parte contratante en la ejecución del contrato, ha obtenido una prestación antes de la terminación del contrato, la parte que haya obtenido dicha prestación deberá pagar a la otra parte una cantidad de dinero equivalente al valor de dicha prestación.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.10
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ text: 'DE LA ONEROSIDAD EXCESIVA.', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ' Las partes de un contrato deben cumplir sus obligaciones contractuales, aun cuando las circunstancias hayan convertido su cumplimiento en más gravoso de lo que razonablemente podrían haber previsto al tiempo de la celebración del contrato. No obstante, se presenta ONEROSIDAD EXCESIVA, cuando una parte del contrato pruebe que:',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      new Paragraph({}),

      // 17.11
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Continuar el cumplimiento de sus obligaciones contractuales ha devenido excesivamente gravoso debido a un hecho fuera de su control razonable, que no era razonablemente previsible que se hubiera tenido en cuenta al tiempo de la celebración del contrato.',
            font: 'Arial MT',
            size: 22
          })
        ]
      }),

      // 17.12
      new Paragraph({
        numbering: { reference: "numeracion17", level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({
            text: 'Y que razonablemente no podría haber evitado o superado el hecho en cuestión o sus consecuencias.',
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
            text: `A partir del momento en que una de las partes notifique a la otra que se ha presentado hechos económicos que acreditan una ONEROSIDAD EXCESIVA, las partes estarán obligadas, dentro de un plazo razonable de treinta (30) días calendario desde que esta Cláusula sea invocada, a negociar condiciones contractuales alternativas que permitan razonablemente superar las consecuencias del hecho.`,
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
            text: `Cuando se acredite por una de las partes los dos supuestos económicos señalados en los numerales 17.11. y 17.12., podrán las partes optar por cualquiera de estas opciones:`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'PRIMERA OPCION:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` MODIFICAR DE MUTUO ACUERDO LAS CONDICIONES DEL CONTRATO PARA QUE EL CONTRATO SEA VIABLE: Las partes podrán acordar condiciones contractuales alternativas temporales o definitivas que le permitan continuar con la ejecución del contrato en un futuro.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'SEGUNDA OPCION:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` TERMINACION DEL CONTRATO POR LA PARTE QUE ALEGO LA ONEROSIDAD EXCESIVA: Si las partes no puedan llegar a acordar condiciones contractuales alternativas que superen la situación económica del contrato, la parte que invoque esta Cláusula de ONEROSIDAD EXCESIVA tendrá derecho a dar por terminado el contrato, pero no podrá solicitar a un experto su adaptación sin el acuerdo de la otra parte.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'TERCERA OPCION:', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: ` DECISION DE UN EXPERTO DESIGNADO POR LAS PARTES O POR LA CAMARA DE COMERCIO DE BOGOTÁ: Si las partes no puedan llegar a acordar condiciones contractuales alternativas que superen la situación económica del contrato, pero tienen el mejor ánimo de continuar con el contrato celebrado, designarán de mutuo acuerdo un EXPERTO y le expondrán conjuntamente las diferencias presentadas con los soportes necesarios para que en el término de diez (10) días calendario defina con fuerza obligatoria para las partes las diferencias y soluciones. La decisión del EXPERTO se deberá entender como un OTRO SI al contrato. Si las partes no se ponen de acuerdo en el EXPERTO, podrán solicitarle a la CAMARA DE COMERCIO DE BOGOTÁ su designación por mutuo acuerdo. Los honorarios del experto serán cancelados por ambas partes.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({ text: 'CLAUSULA DECIMO OCTAVA', bold: true, font: 'Arial MT', size: 22 }),
          new TextRun({
            text: `-. FIRMA DIGITALIZADA: Se aclara y se conviene por las partes que intervienen en la redacción de este contrato que, en el evento en que el mismo sea firmado de manera digitalizada, lo harán en las condiciones en que actúan y que detalladamente se indican en el acápite de identificación de las partes; igualmente se aclara que cuando una parte actúe simultáneamente a título personal y en nombre y representación de una compañía, bastará con una sola firma digitalizada en el respectivo acápite de firmas del contrato, sin que por ello se afecte la validez del documento y la calidad en que actúa quien firma de manera digitalizada. Todo lo anterior, sin perjuicio del cumplimiento a cabalidad de lo preceptuado en la Ley 527 de 1999, Decreto 2364 de 2012 y los estándares internacionales de firma.`,
            font: 'Arial MT',
            size: 22
          }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          new TextRun({ break: 1 }),
          new TextRun({
            text: `En señal de conformidad se suscribe el presente contrato en la ciudad de Cali el día ${data.DIA_LETRAS} (${data.DIA_NUMEROS}) ${data.MES} de ${data.ANO}.`,
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
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ text: "CESAR AUGUSTO TEZNA CASTAÑO", font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: "C.C. 94.492.994", font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: "Representante legal", font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: "AFFI S.A.S.", font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: "NIT. 900.053.370", font: 'Arial MT', size: 22 })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: "NONE" }, bottom: { style: "NONE" }, left: { style: "NONE" }, right: { style: "NONE" } },
                children: [
                  new Paragraph({ text: data.NOMBRE_REPRESENTANTE_LEGAL, font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: `C.C. No ${data.CEDULA_REPRESENTANTE_LEGAL}`, font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: "Representante legal", font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: data.NOMBRE_INMOBILIARIA, font: 'Arial MT', size: 22 }),
                  new Paragraph({ text: data.NIT_INMOBILIARIA, font: 'Arial MT', size: 22 })
                ]
              })
            ]
          })
        ]
      }),

      // Firma Liliana
      new Paragraph({ spacing: { before: 600, after: 200 }, children: [new TextRun({ text: "", size: 22 })] }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: "LILIAN PAOLA HOLGUÍN ORREGO", font: 'Arial MT', size: 22 }),
          new TextRun({ break: 1 }),
          new TextRun({ text: "Gerente Comercial AFFI SAS", font: 'Arial MT', size: 22 })
        ]
      }),
    ]
  }]
});

// 💾 Guardar el archivo
Packer.toBuffer(doc).then(buffer => {
  writeFileSync("Contrato_Fianza.docx", buffer);
  console.log("✅ Contrato natural generado con éxito");
});