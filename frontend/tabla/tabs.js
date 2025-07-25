const tabsArray = Array.from(document.querySelectorAll(".tab-button"));
const contentArray = Array.from(document.querySelectorAll(".select-content"));

function normalizar(str) {
  return str
    ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    : "";
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseSalario(s) {
  if (!s || typeof s !== "string") return 0;
  const match = s.match(/\d+[.,]?\d*/g);
  return match ? parseFloat(match.join("").replace(",", "")) : 0;
}

let trabajos = [];
let codigos = {};
let trabajosActualizados = [];
let mapa = null;

const todosTbody = document.getElementById("TodosSalariosTbody");
const mayoresTbody = document.getElementById("mayorSalarioTbody");
const menoresTbody = document.getElementById("menorSalarioTbody");

function renderFila(t) {
  return `
    <tr class="border-b">
      <td class="px-5 py-2">${t.titulo}</td>
      <td class="px-5 py-2">${t.empresa}</td>
      <td class="px-5 py-2">${t.ubicacion}</td>
      <td class="px-5 py-2">Presencial</td>
      <td class="px-5 py-2 text-right">${t.salario}</td>
    </tr>
  `;
}

// Carga datos de JSON y prepara los trabajos
async function cargarDatos() {
  try {
    const trabajosRes = await fetch("../../data/scraped/trabajos.json");
    trabajos = await trabajosRes.json();

    const codigosRes = await fetch("../../data/codigosP.json");
    codigos = await codigosRes.json();

    // Agregar salario numérico para filtrar
    trabajos.forEach((t) => (t.salarioNum = parseSalario(t.salario)));

    // Asignar código postal basado en ciudad de codigosP.json
    trabajosActualizados = trabajos.map((trabajo) => {
      if (!trabajo.ubicacion) return trabajo;

      const ciudadTrabajo = normalizar(trabajo.ubicacion);

      for (const ciudad in codigos) {
        if (ciudadTrabajo.includes(normalizar(ciudad))) {
          // Asigna un código postal aleatorio de la ciudad encontrada
          const cpAleatorio =
            codigos[ciudad][
              Math.floor(Math.random() * codigos[ciudad].length)
            ];
          return { ...trabajo, codigo_postal: cpAleatorio.cp };
        }
      }
      return trabajo;
    });

    renderTablas();
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function renderTablas() {
  todosTbody.innerHTML = "";
  mayoresTbody.innerHTML = "";
  menoresTbody.innerHTML = "";

  // Todos
  trabajos.forEach((t) => {
    todosTbody.innerHTML += renderFila(t);
  });

  // Salarios altos (top 10)
  const trabajosMayores = trabajos
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

  // Salarios bajos (<= 30,000)
  const trabajosMenores = trabajos
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
}

function mostrarTrabajosCercanos(latUsuario, lonUsuario) {
  const divMapa = document.getElementById("cerca_de_mi");

  if (mapa) {
    mapa.remove();
    mapa = null;
  }

  mapa = L.map(divMapa).setView([latUsuario, lonUsuario], 20);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapa);

  L.marker([latUsuario, lonUsuario])
    .addTo(mapa)
    .bindPopup("Tú estás aquí")
    .openPopup();

  trabajosActualizados.forEach((trabajo) => {
    const ciudad = Object.keys(codigos).find((c) =>
      normalizar(trabajo.ubicacion || "").includes(normalizar(c))
    );

    if (ciudad && trabajo.codigo_postal) {
      const match = codigos[ciudad].find(
        (cp) => cp.cp === trabajo.codigo_postal
      );

      if (match) {
        const distancia = calcularDistancia(
          latUsuario,
          lonUsuario,
          match.lat,
          match.lng
        );

        if (distancia <= 20000) {
          L.marker([match.lat, match.lng])
            .addTo(mapa)
            .bindPopup(
              `<div style="min-width:220px; font-family: Arial, sans-serif;"> 
                 <h3 style="margin:0 0 6px 0; font-size:16px; font-weight:bold; color:#2c3e50;">
                   ${trabajo.titulo}
                 </h3>
                 <p style="margin:2px 0; font-size:14px; color:#34495e;">
                   <strong>Empresa:</strong> ${trabajo.empresa || 'No disponible'}
                 </p>
                 <p style="margin:2px 0; font-size:14px; color:#34495e;">
                   <strong>Salario:</strong> ${trabajo.salario || 'No especificado'}
                 </p>
                 <p style="margin:2px 0; font-size:14px; color:#34495e;">
                   <strong>Ubicación:</strong> ${trabajo.ubicacion || 'No disponible'}
                 </p>
                 <p style="margin:2px 0; font-size:14px; color:#34495e;">
                   <strong>Latitud:</strong> ${match.lat.toFixed(6)}
                 </p>
                 <p style="margin:2px 0; font-size:14px; color:#34495e;">
                   <strong>Longitud:</strong> ${match.lng.toFixed(6)}
                 </p>
               </div>`
            );
        }
      }
    }
  });
}

function pedirUbicacionYMostrarMapa() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      mostrarTrabajosCercanos(lat, lon);
    },
    (err) => {
      alert(`Error obteniendo ubicación: ${err.message}`);
    }
  );
}

// Manejo de clicks en tabs
tabsArray.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabsArray.forEach((t) => t.classList.remove("bg-blue-200"));
    tabsArray.forEach((t) => t.classList.add("bg-gray-200"));
    contentArray.forEach((c) => c.classList.add("hidden"));

    tab.classList.add("bg-blue-200");
    tab.classList.remove("bg-gray-200");
    contentArray[index].classList.remove("hidden");

    // Si el tab es el de "Cerca de mí", pide ubicación y muestra mapa
    if (tab.textContent.trim().toLowerCase() === "cerca de mí") {
      pedirUbicacionYMostrarMapa();
    }
  });
});

// Carga inicial de datos y muestra la primer pestaña "Todos"
cargarDatos().then(() => {
  tabsArray[0].classList.add("bg-blue-200");
  tabsArray[0].classList.remove("bg-gray-200");
  contentArray[0].classList.remove("hidden");
});
