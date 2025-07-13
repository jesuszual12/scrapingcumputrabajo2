const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const result = document.getElementById('resultSection');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const cargo = input.value.trim();

  if (cargo === "") {
    result.innerHTML = `<span class="text-danger">Por favor, ingresa el cargo o categoría.</span>`;
    return;
  }

  result.innerHTML = `<span class="text-secondary">Buscando ofertas para: <strong>${cargo}</strong>...</span>`;

  try {
    const response = await fetch('http://localhost:3000/buscar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cargo })
    });

    const data = await response.json();
    localStorage.setItem("trabajosData", JSON.stringify(data));
    window.location.href = "../tabla/index.html";
  } catch (error) {
    console.error(error);
    result.innerHTML = `<span class="text-danger">Error al buscar trabajos.</span>`;
  }
});
