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

const rutaJSON = "/tmp/datosTemp.json";
const raw = readFileSync(rutaJSON, "utf-8");
const input = JSON.parse(raw);

function formatearNumeroConPuntos(numero) {
  const numStr = numero.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
