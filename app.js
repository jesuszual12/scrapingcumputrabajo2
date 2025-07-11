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

          const ubicacion = textoSelector("main.detail_fs > div.container > p.fs16")
          const empresa_ubi = ubicacion.split(" - ");
          const location = empresa_ubi[1];
          const empresa = empresa_ubi[0];

          const descripcion = textoSelector("div.container > div.box_detail.fl.w100_m > div.mb40.pb40.bb1 > p.mbB");
          const descrip = descripcion.replace(/\n/g, "").trim();

            return {
              titulo: textoSelector("h1"),
              empresa: empresa, 
              ubicacion: location,
              salario: (document.body.innerText.match(/\$\s*[\d.,]+/) || ["No especificado"])[0],
              descripcion: descrip,
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
