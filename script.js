// TRABAJO REALIZADO POR JOSE MANUEL GOMEZ RUIZ E IRENE MENDOZA MEDEROS


// Configuración inicial del canvas del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Variables en el HUD/UI
const scoreElement = document.getElementById('puntuacion');
const levelElement = document.getElementById('nivel');
const missilesElement = document.getElementById('misiles');


// Este console log lo ponemos para comprobar que el canvas funciona 
console.log('Canvas inicializado:', canvas.width, 'x', canvas.height);

// =====================================
// CARGA DE SPRITES
// =====================================
const spriteCiudad = new Image();
spriteCiudad.src = 'sprites/Ciudad.png';

const spritePuntero = new Image();
spritePuntero.src = 'sprites/Puntero.png';

const spriteTierra = new Image();
spriteTierra.src = 'sprites/Tierra.png';

const spriteMisil = new Image();
spriteMisil.src = 'sprites/Misil.png';

const spriteAvion = new Image();
spriteAvion.src = 'sprites/Avion.png';

const spriteNave = new Image();
spriteNave.src = 'sprites/Nave.png';

const spriteBateria = new Image();
spriteBateria.src = 'sprites/3LanzaMisil.png';


//============================
// Clase Juego. Controlamos el juego aqui
//============================
class Juego {
    constructor(){
        // Estado del juego
        this.estado = 'menu'; // 'menu', 'jugando', 'pausa', 'gameover'

        // Estadísticas
        this.puntuacion = 0;
        this.nivel = 1;

        // Arrays para almacenar los objetos
        this.misilEnemigos = [];
        this.misilDefensas = [];
        this.explosiones = [];
        this.ciudades = [];
        this.baterias = [];

        // Control del tiempo
        this.ultimoTiempo = 0;

        // Log para comprobar que se inicia
        console.log('Juego creado');
    }

    iniciar(){
        console.log('Iniciando juego...');
        this.estado = 'jugando';
        this.puntuacion = 0;
        this.nivel = 1;

        // Limpiar arrays para cuando reiniciemos
        this.ciudades = [];
        this.baterias = [];
        this.misilEnemigos = [];
        this.misilDefensas = [];
        this.explosiones = [];

        // Crear ciudades
        const numCiudades = 6;
        const espaciado = canvas.width / (numCiudades + 1);

        for (let i = 0; i < numCiudades; i++){
            const x = espaciado * (i+1) - 20; // Asi centramos la ciudad
            const y = canvas.height - 60; // A 60 del suelo
            this.ciudades.push(new Ciudad(x, y));
        }

        // Iniciamos el bucle del juego
        this.bucleDelJuego(0);
    }

    bucleDelJuego(tiempoActual){
        // Calcular delta time (el tiempo entre frames)
        const deltaTime = tiempoActual - this.ultimoTiempo;
        this.ultimoTiempo = tiempoActual;

        // Actualzamos y dibujamos SOLO si está jugando
        if (this.estado === 'jugando'){
            this.actualizar(deltaTime);
            this.dibujar();
        }

        // Pedimos el siguiente frame (actualizamos el bucle)
        requestAnimationFrame((t) => this.bucleDelJuego(t));
    }

    actualizar(deltaTime){
        // TODO: actualizar los objetos del juego

        console.log('Actualizando juego, deltaTime:', deltaTime);
    }

    dibujar(){
        // Limpiamos el canvas (lo ponemos todo negro)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        //Dibujar las ciudades
        this.ciudades.forEach(ciudad => ciudad.dibujar(ctx));
        // Actualizar UI
        scoreElement.textContent = this.puntuacion;
        levelElement.textContent = this.nivel;
    }
}

// Creamos la instancia del juego
const juego = new Juego();

console.log('Juego listo')

// Bindeo del boton
const botonIniciar = document.getElementById('startBtn');
botonIniciar.addEventListener('click', () => {
    juego.iniciar();
});



// =====================================
// CLASE CIUDAD
// =====================================
class Ciudad {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ancho =40;
        this.alto = 40;
        this.intacta = true;
    }

    destruir() {
        this.intacta = false;
        console.log('Ciudad destruida en:', this.x, this.y);
    }

    dibujar(ctx){
        if(this.intacta){
            // Dibujar desde el sprite
            ctx.drawImage(spriteCiudad, this.x, this.y, this.ancho, this.alto);
        } else {
            // Ciudad destruida, intento de dibujo de escombros rojos, a ver que nos sale
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y + this.alto - 5, this.ancho, 5);
        }
    }
}