const puppeteer = require("puppeteer");
const exportAll = require("./src/js/exportAll");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Server funcionando",
  });
});

app.post("/buscar", async (req, res) => {
  let { cargo } = req.body;

  (async () => {
    const baseURL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(
      cargo
    )}`;

    console.log(`:::::::: Buscando trabajos de "${cargo}" ::::::::::`);

    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 300,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-features=site-per-process",
        "--disable-site-isolation-trials",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--blink-settings=imagesEnabled=false",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
      dumplo: true,
    });

    const page = await browser.newPage();

    let trabajos = [];
    let pagina = 1;

    try {
      while (true) {
        const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });


        try {
          await page.waitForSelector("article a", { timeout: 15000 });
        } catch (selectorError) {
          console.warn(`Selector "article a" no encontrado en ${url} después de 15 segundos.`);
          const pageContent = await page.content();
          console.log("Contenido de la página:", pageContent);
          break;
        }


        const enlaces = await page.$$eval("article a", (links) =>
          Array.from(
            new Set(
              links
                .map((link) => link.href)
                .filter((href) => href.includes("/ofertas-de-trabajo/"))
            )
          )
        );

        if (enlaces.length === 0) {
          break;
        }

        for (const enlace of enlaces) {
          try {
            const tab = await browser.newPage();
            await tab.goto(enlace, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });

            const datos = await tab.evaluate(() => {
              const textoSelector = (sel) =>
                document.querySelector(sel)?.innerText.trim() ||
                "No disponible";

              const ubicacion = textoSelector(
                "main.detail_fs > div.container > p.fs16"
              );
              const empresa_ubi = ubicacion.split(" - ");
              const location = empresa_ubi[1];
              const empresa = empresa_ubi[0];

              const descripcion = textoSelector(
                "div.container > div.box_detail.fl.w100_m > div.mb40.pb40.bb1 > p.mbB"
              );
              const descrip = descripcion.replace(/\n/g, "").trim();

              return {
                titulo: textoSelector("h1"),
                empresa: empresa,
                ubicacion: location,
                salario: (document.body.innerText.match(/\$\s*[\d.,]+/) || [
                  "No especificado",
                ])[0],
                descripcion: descrip,
                url: window.location.href,
              };
            });

            trabajos.push(datos);
            await tab.close();
          } catch (err) {
            console.warn(
              `⚠️ Error al extraer datos de ${enlace}: ${err.message}`
            );
          }
        }

        pagina++;
      }

      console.log(`se encontraron: ${trabajos.length} trabajos`);
      console.log("Fin del scrapping");
      await exportAll(trabajos, `trabajos`);
      return res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
      console.error("❌ Error durante el scraping:", error);
    }

    await browser.close();
  })();
});

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
});
