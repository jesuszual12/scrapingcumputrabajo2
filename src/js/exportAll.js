// src/js/exportAll.js
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");

const exportAll = async (data, nombreBase = "trabajos") => {
  if (!data.length) {
    console.warn("⚠️ No hay datos para exportar.");
    return;
  }

  const carpetaDestino = path.join(__dirname, "../../data");
  if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
  }

  // Limpiar archivos anteriores en la carpeta destino
  const formatos = [".json", ".csv", ".txt", ".xlsx", ".pdf"];
  fs.readdirSync(carpetaDestino).forEach((file) => {
    if (formatos.includes(path.extname(file))) {
      fs.unlinkSync(path.join(carpetaDestino, file));
    }
  });

  // JSON
  fs.writeFileSync(
    path.join(carpetaDestino, `${nombreBase}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  // CSV
  const parser = new Parser();
  const csv = parser.parse(data);
  fs.writeFileSync(
    path.join(carpetaDestino, `${nombreBase}.csv`),
    csv,
    "utf-8"
  );

  // TXT
  const txt = data
    .map(
      (t, i) =>
        `--- Trabajo ${i + 1} ---\nTítulo: ${t.titulo}\nEmpresa: ${
          t.empresa
        }\nUbicación: ${t.ubicacion}\nSalario: ${t.salario}\nDescripción: ${
          t.descripcion
        }\nURL: ${t.url}`
    )
    .join("\n\n");
  fs.writeFileSync(
    path.join(carpetaDestino, `${nombreBase}.txt`),
    txt,
    "utf-8"
  );

  // Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trabajos");
  XLSX.writeFile(wb, path.join(carpetaDestino, `${nombreBase}.xlsx`));

  // PDF
  const doc = new PDFDocument({ margin: 30 });
  const pdfPath = path.join(carpetaDestino, `${nombreBase}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(20).text("Ofertas de Trabajo", { align: "center" }).moveDown();

  data.forEach((t, i) => {
    doc
      .fontSize(12)
      .text(`📌 Trabajo ${i + 1}:`, { underline: true })
      .text(`Título: ${t.titulo}`)
      .text(`Empresa: ${t.empresa}`)
      .text(`Ubicación: ${t.ubicacion}`)
      .text(`Salario: ${t.salario}`)
      .text(`Descripción: ${t.descripcion}`)
      .text(`URL: ${t.url}`)
      .moveDown();
  });

  doc.end();

  console.log(`✅ Archivos exportados en: ${carpetaDestino}`);
};

module.exports = exportAll;
