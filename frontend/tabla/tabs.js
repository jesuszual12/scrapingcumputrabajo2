fetch("../../data/trabajos.json")
  .then((res) => res.json())
  .then((trabajos) => {
    const parseSalario = (s) => {
      if (!s || typeof s !== "string") return 0;
      const match = s.match(/\d+[.,]?\d*/g);
      return match ? parseFloat(match.join("").replace(",", "")) : 0;
    };

    trabajos.forEach((t) => (t.salarioNum = parseSalario(t.salario)));

    const todosTbody = document.getElementById("TodosSalariosTbody");
    const mayoresTbody = document.getElementById("mayorSalarioTbody");
    const menoresTbody = document.getElementById("menorSalarioTbody");
    const mapa = document.getElementById("cerca_de_mi");

    const jtrabajos = JSON.parse(fs.readFileSync('trabajos.json', 'utf8'));
    const codigos = JSON.parse(fs.readFileSync('codigosP.json', 'utf8'));

    //comparacion de datos
    const normalizar = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    //agregamos codigo postal a coincidencia
    
    const trabajosActualizados = jtrabajos.map((trabajo) => {
      if (!trabajo.ubicacion) 
        return trabajo;
      
      const ciudadTrabajo = normalizar(trabajo.ubicacion);

      for (const ciudad in codigos) {
         if (ciudadTrabajo.includes(normalizar(ciudad))) {
         const cpAleatorio = codigos[ciudad][Math.floor(Math.random() * codigos[ciudad].length)];
         return { ...trabajo, codigo_postal: cpAleatorio.cp };
      }
    }

     return trabajo;
  });

  //termina la agreacion de codigos postales

    //* codigo para el mapa ------ INICIO

    function pedirUbicacion() {
      if (!navigator.geolocation) {
        alert("Geolocalización no soportada por tu navegador.");
        limpiarMapa();
        return;
      }
      

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          mostrarMapa(lat, lon);
        },
        (err) => {
          alert(`Error obteniendo ubicación: ${err.message}`);
          limpiarMapa();
        }
      );
    }

    function mostrarMapa(lat, lon) {
      if (mapa) {
        mapa.remove();
      }

      mapa = L.map("map").setView([lat, lon], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapa);

      L.marker([lat, lon]).addTo(mapa).bindPopup("Estás aquí").openPopup();
    }

    function limpiarMapa() {
      if (mapa) {
        mapa.remove();
        mapa = null;
      }
      document.getElementById("cerca_de_mi").innerHTML = "";
    }
    //* codigo para el mapa ------ FIN

    const renderFila = (t) => `
      <tr class="border-b">
        <td class="px-5 py-2">${t.titulo}</td>
        <td class="px-5 py-2">${t.empresa}</td>
        <td class="px-5 py-2">${t.ubicacion}</td> 
        <td class="px-5 py-2">Presencial</td>
        <td class="px-5 py-2 text-right">${t.salario}</td>
        
      </tr>
    `;

    // TODOS LOS TRABAJOS
    trabajos.forEach((t) => {
      todosTbody.innerHTML += renderFila(t);
    });

    const trabajosMayores = [...trabajos]
      .filter((t) => t.salario && t.salario !== "No especificado")
      .sort((a, b) => b.salarioNum - a.salarioNum)
      .slice(0, 10);

    if (trabajosMayores.length === 0) {
      mayoresTbody.innerHTML = `
        <tr><td colspan="5" class="px-5 py-4 text-center text-gray-500">
          No hay trabajos con salario alto.
        </td></tr>
      `;
    } else {
      trabajosMayores.forEach((t) => {
        mayoresTbody.innerHTML += renderFila(t);
      });
    }

    const trabajosMenores = [...trabajos]
      .filter((t) => t.salario && t.salario !== "No especificado")
      .filter((t) => t.salarioNum <= 30000)
      .sort((a, b) => a.salarioNum - b.salarioNum)
      .slice(0, 10);

    if (trabajosMenores.length === 0) {
      menoresTbody.innerHTML = `
        <tr><td colspan="5" class="px-5 py-4 text-center text-gray-500">
          No hay trabajos con salario menor o igual a $30,000.
        </td></tr>
      `;
    } else {
      trabajosMenores.forEach((t) => {
        menoresTbody.innerHTML += renderFila(t);
      });
    }
  })
  .catch((err) => {
    console.error("❌ Error cargando el archivo trabajos_next.json", err);
  });

const tabsArray = Array.from(document.querySelectorAll(".tab-button"));
const contentArray = Array.from(document.querySelectorAll(".select-content"));

tabsArray.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabsArray.forEach((t) => t.classList.remove("bg-blue-200"));
    tabsArray.forEach((t) => t.classList.add("bg-gray-200"));
    contentArray.forEach((c) => c.classList.add("hidden"));

    tab.classList.add("bg-blue-200");
    tab.classList.remove("bg-gray-200");
    contentArray[index].classList.remove("hidden");
  });
});
