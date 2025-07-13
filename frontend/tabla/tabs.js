fetch('../../trabajos_next.json')
  .then(res => res.json())
  .then(trabajos => {
    const parseSalario = (s) => {
      const match = s.match(/\\d+[.,]?\\d*/g);
      return match ? parseFloat(match.join('').replace(',', '')) : 0;
    };

    trabajos.forEach(t => t.salarioNum = parseSalario(t.salario));

    const todosTbody = document.getElementById("TodosSalariosTbody");
    const mayoresTbody = document.getElementById("mayorSalarioTbody");
    const menoresTbody = document.getElementById("menorSalarioTbody");

    const renderFila = (t) => `
      <tr>
        <td class="px-5 py-2">${t.titulo}</td>
        <td class="px-5 py-2">${t.empresa}</td>
        <td class="px-5 py-2">${t.ubicacion}</td>
        <td class="px-5 py-2">Presencial</td>
        <td class="px-5 py-2 text-right">${t.salario}</td>
      </tr>
    `;

    trabajos.forEach(t => todosTbody.innerHTML += renderFila(t));

    [...trabajos]
      .sort((a, b) => b.salarioNum - a.salarioNum)
      .slice(0, 10)
      .forEach(t => mayoresTbody.innerHTML += renderFila(t));

    [...trabajos]
      .sort((a, b) => a.salarioNum - b.salarioNum)
      .slice(0, 10)
      .forEach(t => menoresTbody.innerHTML += renderFila(t));
  })
  .catch(err => {
    console.error("❌ Error cargando el archivo trabajos_next.json", err);
  });

// TAB switching logic
const tabsArray = Array.from(document.querySelectorAll('#home-tab'));
const contentArray = Array.from(document.querySelectorAll('#select-content'));

tabsArray.forEach(tab => {
  tab.addEventListener('click', () => {
    tabsArray.forEach(t => t.classList.remove('bg-blue-200'));
    contentArray.forEach(content => content.classList.add('hidden'));

    const currentTab = tabsArray.indexOf(tab);
    tab.classList.add('bg-blue-200');
    contentArray[currentTab].classList.remove('hidden');
  });
});
