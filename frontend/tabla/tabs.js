fetch('./trabajos_next.json')
  .then(res => res.json())
  .then(trabajos => {
    const parseSalario = (s) => {
      if (!s || typeof s !== 'string') return 0;
      const match = s.match(/\d+[.,]?\d*/g);
      return match ? parseFloat(match.join('').replace(',', '')) : 0;
    };

    trabajos.forEach(t => t.salarioNum = parseSalario(t.salario));

    const todosTbody = document.getElementById("TodosSalariosTbody");
    const mayoresTbody = document.getElementById("mayorSalarioTbody");
    const menoresTbody = document.getElementById("menorSalarioTbody");

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
    trabajos.forEach(t => {
      todosTbody.innerHTML += renderFila(t);
    });

    const trabajosMayores = [...trabajos]
      .filter(t => t.salario && t.salario !== 'No especificado')
      .sort((a, b) => b.salarioNum - a.salarioNum)
      .slice(0, 10);

    if (trabajosMayores.length === 0) {
      mayoresTbody.innerHTML = `
        <tr><td colspan="5" class="px-5 py-4 text-center text-gray-500">
          No hay trabajos con salario alto.
        </td></tr>
      `;
    } else {
      trabajosMayores.forEach(t => {
        mayoresTbody.innerHTML += renderFila(t);
      });
    }

    const trabajosMenores = [...trabajos]
      .filter(t => t.salario && t.salario !== 'No especificado')
      .filter(t => t.salarioNum <= 30000)
      .sort((a, b) => a.salarioNum - b.salarioNum)
      .slice(0, 10);

    if (trabajosMenores.length === 0) {
      menoresTbody.innerHTML = `
        <tr><td colspan="5" class="px-5 py-4 text-center text-gray-500">
          No hay trabajos con salario menor o igual a $30,000.
        </td></tr>
      `;
    } else {
      trabajosMenores.forEach(t => {
        menoresTbody.innerHTML += renderFila(t);
      });
    }
  })
  .catch(err => {
    console.error("❌ Error cargando el archivo trabajos_next.json", err);
  });

const tabsArray = Array.from(document.querySelectorAll('.tab-button'));
const contentArray = Array.from(document.querySelectorAll('.select-content'));

tabsArray.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    tabsArray.forEach(t => t.classList.remove('bg-blue-200'));
    tabsArray.forEach(t => t.classList.add('bg-gray-200'));
    contentArray.forEach(c => c.classList.add('hidden'));

    tab.classList.add('bg-blue-200');
    tab.classList.remove('bg-gray-200');
    contentArray[index].classList.remove('hidden');
  });
});
