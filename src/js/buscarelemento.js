const readline = require("readline");

function buscarElemento() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function pregunta() {
      rl.question("Cargo o categoría de trabajo: ", (respuesta) => {
        const argumentoBusqueda = respuesta.trim();
        if (argumentoBusqueda === "") {
          console.log("Entrada inválida. No puede estar vacía.");
          pregunta();
        } else {
          rl.close();
          resolve(argumentoBusqueda);
        }
      });
    }

    pregunta();
  });
}

module.exports = buscarElemento;
