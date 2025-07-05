const puppeteer = require("puppeteer");
const buscarElemento = require("./src/js/buscarelemento");
const fs = require("fs");
const path = require("path");

(async () => {
  const busqueda = await buscarElemento();
  const baseURL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(busqueda)}`;

  console.log(`:::::::: Buscando trabajos de "${busqueda}" ::::::::::`);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 300,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  let trabajos = [];
  let pagina = 1;

  try {
    while (true) {
      const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;
      console.log(`📄 Visitando página de listados: ${url}`);

      await page.goto(url, { waitUntil: "domcontentloaded" });

      const enlaces = await page.$$eval("article a", links =>
        Array.from(new Set(links
          .map(link => link.href)
          .filter(href => href.includes("/ofertas-de-trabajo/"))
        ))
      );

      if (enlaces.length === 0) {
        console.log("🚫 No hay más ofertas en esta página, fin del scraping.");
        break;
      }

      for (const enlace of enlaces) {
        console.log(`🔍 Abriendo oferta: ${enlace}`);

        try {
          const tab = await browser.newPage();
          await tab.goto(enlace, { waitUntil: "domcontentloaded", timeout: 30000 });

          const datos = await tab.evaluate(() => {
            const textoSelector = (sel) => document.querySelector(sel)?.innerText.trim() || "No disponible";

            return {
              titulo: textoSelector("h1"),
              empresa: textoSelector('[data-qa="vacancy-company-name"]') || textoSelector(".wt-display-inline"),
              ubicacion: textoSelector('[data-qa="vacancy-location"]') || textoSelector(".wt-pre-line"),
              salario: (document.body.innerText.match(/\$\s*[\d.,]+/) || ["No especificado"])[0],
              descripcion: textoSelector(".bDesc, .box_detail, .bVew").slice(0, 1000),
              url: window.location.href
            };
          });

          trabajos.push(datos);
          await tab.close();
        } catch (err) {
          console.warn(`⚠️ Error al extraer datos de ${enlace}: ${err.message}`);
        }
      }

      pagina++;
    }

    const rutaArchivo = path.join(__dirname, `trabajos_${busqueda}.json`);
    fs.writeFileSync(rutaArchivo, JSON.stringify(trabajos, null, 2), "utf-8");

    console.log(`✅ Guardados ${trabajos.length} trabajos en:\n${rutaArchivo}`);

  } catch (error) {
    console.error("❌ Error durante el scraping:", error);
  }

  await browser.close();
})();
