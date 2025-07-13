const fs = require("fs");
const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");

async function exportAll(data, nombreBase = "trabajos") {
  if (!data || !data.length) {
    console.warn("⚠️ No hay datos para exportar.");
    return;
  }

  // 1. JSON
  fs.writeFileSync(`${nombreBase}.json`, JSON.stringify(data, null, 2), "utf-8");

  // 2. CSV
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    fs.writeFileSync(`${nombreBase}.csv`, csv, "utf-8");
  } catch (err) {
    console.error("❌ Error exportando CSV:", err.message);
  }

  // 3. Excel
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trabajos");
    XLSX.writeFile(wb, `${nombreBase}.xlsx`);
  } catch (err) {
    console.error("❌ Error exportando Excel:", err.message);
  }

  // 4. TXT
  try {
    let contenido = "";
    data.forEach((item, i) => {
      contenido += `--- Trabajo ${i + 1} ---\n`;
      for (let key in item) {
        contenido += `${key.toUpperCase()}: ${item[key]}\n`;
      }
      contenido += "\n";
    });
    fs.writeFileSync(`${nombreBase}.txt`, contenido, "utf-8");
  } catch (err) {
    console.error("❌ Error exportando TXT:", err.message);
  }

  // 5. PDF
  try {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(`${nombreBase}.pdf`));
    doc.fontSize(18).text("Listado de Trabajos", { align: "center" }).moveDown();

    data.forEach((item, i) => {
      doc.fontSize(12).text(`Trabajo ${i + 1}`, { underline: true });
      for (let key in item) {
        doc.fontSize(10).text(`${key}: ${item[key]}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error exportando PDF:", err.message);
  }

  console.log("✅ Exportaciones completadas (CSV, JSON, Excel, TXT, PDF)");
}

module.exports = exportAll;
