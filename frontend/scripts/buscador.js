const form = document.getElementById('searchForm');
      const input = document.getElementById('searchInput');
      const result = document.getElementById('resultSection');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if(input.value.trim() !== "") {
          result.innerHTML = `<span class="text-success fw-semibold">Buscaste:</span> <span class="fw-bold">${input.value}</span>`;
        } else {
          result.innerHTML = `<span class="text-danger">Por favor, de ingresar el cargo o categoría.</span>`;
        }
      });

      // 10 ofertas con mayor salario



      //10 ofertas con menor salario






