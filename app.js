const puppeteer = require("puppeteer");
const buscarElemento = require("./src/js/buscarelemento");

(async () => {
  const busqueda = await buscarElemento();
  const URL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(busqueda)}`;

  console.log(`:::::::::::::::::: Buscando :::::::::::::::::: ${busqueda}`);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 1000,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });

  console.log(">>>>>>>>>>>> SCRAPEANDO TITULOS DEL LISTADO <<<<<<<<<<<");

  const titulos = await page.$$eval("article div.bClick h1", elementos =>
    elementos.map(el => el.textContent.trim())
  );

  console.log("Títulos encontrados:", titulos);

  await browser.close();
})();
