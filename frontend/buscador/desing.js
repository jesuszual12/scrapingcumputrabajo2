const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const result = document.getElementById('resultSection');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const cargo = input.value.trim().toLowerCase();

  if (cargo === "") {
    result.innerHTML = `<span class="text-danger">Por favor, ingresa el cargo o categoría.</span>`;
    return;
  }

  result.innerHTML = `<span class="text-secondary">Buscando ofertas para: <strong>${cargo}</strong>...</span>`;

  try {
    const response = await fetch('../tabla/trabajos_next.json');
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo JSON: ${response.status}`);
    }

    const trabajos = await response.json();

    const resultados = trabajos.filter(trabajo =>
      trabajo.titulo.toLowerCase().startsWith(cargo)
    );

    if (resultados.length === 0) {
      result.innerHTML = `<span class="text-warning">No se encontraron trabajos para: <strong>${cargo}</strong>.</span>`;
      return;
    }

    localStorage.setItem("trabajosData", JSON.stringify(resultados));
    window.location.href = "../tabla/resultados.html";

  } catch (error) {
    console.error("Error al buscar trabajos:", error);
    result.innerHTML = `<span class="text-danger">Error al buscar trabajos. ${error.message}</span>`;
  }
});
