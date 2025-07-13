const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const exportAll = require("./src/js/exportAll");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/buscar", async (req, res) => {
  const busqueda = req.body.cargo;
  const baseURL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(busqueda)}`;
  const trabajos = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let pagina = 1;

  try {
    while (true) {
      const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const enlaces = await page.$$eval("article a", links =>
        Array.from(new Set(links.map(link => link.href).filter(href => href.includes("/ofertas-de-trabajo/"))))
      );

      if (enlaces.length === 0) break;

      for (const enlace of enlaces) {
        try {
          const tab = await browser.newPage();
          await tab.goto(enlace, { waitUntil: "domcontentloaded", timeout: 30000 });

          const datos = await tab.evaluate(() => {
            const textoSelector = (sel) => document.querySelector(sel)?.innerText.trim() || "No disponible";

            const ubicacion = textoSelector("main.detail_fs > div.container > p.fs16");
            const empresa_ubi = ubicacion.split(" - ");
            const location = empresa_ubi[1] || "No disponible";
            const empresa = empresa_ubi[0] || "No disponible";

            const descripcion = textoSelector("div.container > div.box_detail.fl.w100_m > div.mb40.pb40.bb1 > p.mbB");
            const descrip = descripcion.replace(/\n/g, "").trim();

            return {
              titulo: textoSelector("h1"),
              empresa,
              ubicacion: location,
              salario: (document.body.innerText.match(/\$\s*[\d.,]+/) || ["No especificado"])[0],
              descripcion: descrip,
              url: window.location.href
            };
          });

          trabajos.push(datos);
          await tab.close();
        } catch {}
      }

      pagina++;
    }

    const nombreArchivo = `trabajos_next`;
    await exportAll(trabajos, nombreArchivo);
    res.json(trabajos);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Scraping fallido" });
  }

  await browser.close();
});

app.listen(PORT, () => console.log(`✅ API escuchando en http://localhost:${PORT}`));
