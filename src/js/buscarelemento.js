//importar el modulo 'readline'

const { resolve } = require('path');
const readline = require('readline');

function buscarElemento(){    
    return new Promise((resolve)=>{
        
        // Crear una Interafaz de lectura con readline
        const rl = readline.createInterface({
            input : process.stdin,
            output : process.stdout
        });
        // funcion auxiliar para hacer la pregunta de forma recursiva si la entrada es invalida
        function pregunta(){
            rl.question("Cargo o categoria de trabajo: ", (respuesta)=>
            {const argumentoBusqueda = respuesta.trim();
            if(argumentoBusqueda === ''){
                console.log('Entrada Invalida. No puedes estar vacio o contener solo espacios');
                pregunta();
             }else{
                rl.close()
                resolve(argumentoBusqueda);
             }
            }
        )
        }
        pregunta();
    });

//
        
}

module.exports = buscarElemento;
