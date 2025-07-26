document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("resultSection");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const form = document.getElementById("searchForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cargo = input.value.trim();
    if (!cargo) {
      result.innerHTML =
        '<span class="text-danger">Por favor, ingresa el cargo o categoría.</span>';
      return;
    }

    result.innerHTML = "";
    loadingSpinner.classList.remove("hidden");

    try {
      const response = await fetch("http://localhost:3000/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo }),
      });

      console.log("Status recibido:", response.status);

      if (response.ok) {
        // Redirige usando ruta absoluta para Live Server
        window.location.replace(
          `${window.location.origin}/frontend/tabla/index.html`
        );
      } else {
        result.innerHTML = `<span class="text-danger">Error en la búsqueda.</span>`;
      }
    } catch (error) {
      console.error(error);
      result.innerHTML = `<span class="text-danger">Error de conexión.</span>`;
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  });
});
