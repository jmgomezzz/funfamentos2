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

        // Sistema de oleadas
        this.tiempoDesdeUltimaOleada = 0;
        this.intervalMisiles = 2000;
        this.misilesEnOleada = 5;
        this.misilesLanzados = 0;

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

        // Reset oleada
        this.misilesLanzados = 0;
        this.tiempoDesdeUltimaOleada = 0;

        // Crear ciudades
        const numCiudades = 6;
        const espaciado = canvas.width / (numCiudades + 1);

        for (let i = 0; i < numCiudades; i++){
            const x = espaciado * (i+1) - 20; // Asi centramos la ciudad
            const y = canvas.height - 60; // A 60 del suelo
            this.ciudades.push(new Ciudad(x, y));
        }

        // Crear baterias
        const bateriaPosY = canvas.height - 40;
        const misilesIniciales = 10;

        // Bateria izquierda
        this.baterias.push(new Bateria(50, bateriaPosY, misilesIniciales));

        // Bateria central
        this.baterias.push(new Bateria(canvas.width / 2, bateriaPosY, misilesIniciales));
        
        // Bateria derecha
        this.baterias.push(new Bateria(canvas.width - 50, bateriaPosY, misilesIniciales));

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
        // Actualizar baterias
        this.baterias.forEach(bateria => bateria.actualizar(deltaTime));

        // Generacion de misiles
        if (this.misilesLanzados < this.misilesEnOleada){
            this.tiempoDesdeUltimaOleada += deltaTime;

            if (this.tiempoDesdeUltimaOleada >= this.intervalMisiles){
                this.generarMisilEnemigo();
                this.tiempoDesdeUltimaOleada = 0;
            }
        }

        // Actualizar misiles enemigos
        this.misilEnemigos.forEach(misil => misil.actualizar(deltaTime));

            

        // Actualizar misiles de defensa
        this.misilDefensas.forEach(misil => {
            misil.actualizar(deltaTime);

            // Si el misil acaba de llegar, crea una explosion
            if (misil.llegado){
                const explosion = new Explosion(misil.objetivoX, misil.objetivoY);
                this.explosiones.push(explosion);
            }
        });
        
        
        // Eliminar misiles de defensa que han llegado
        this.misilDefensas = this.misilDefensas.filter(misil => !misil.llegado);

        // Actualizar explosiones
        this.explosiones.forEach(explosion => explosion.actualizar(deltaTime));

        // Elimina explosiones inactivas
        this.explosiones = this.explosiones.filter(explosion => explosion.activa);

        console.log('Actualizando juego, deltaTime:', deltaTime);
    }

    dibujar(){
        // Limpiamos el canvas (lo ponemos todo negro)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        //Dibujar las ciudades
        this.ciudades.forEach(ciudad => ciudad.dibujar(ctx));

        //Dibujar las baterias
        this.baterias.forEach(bateria => bateria.dibujar(ctx));

        //Dibujar los misiles enemigos
        this.misilEnemigos.forEach(misil => misil.dibujar(ctx));

        //Dibujar los misiles de defensa
        this.misilDefensas.forEach(misil => misil.dibujar(ctx));

        //Dibujar las explosiones
        this.explosiones.forEach(explosion => explosion.dibujar(ctx));

        // Actualizar UI
        scoreElement.textContent = this.puntuacion;
        levelElement.textContent = this.nivel;
    }


    generarMisilEnemigo(){
        // Posicion aleatoria arriba
        const inicioX = Math.random() * canvas.width;

        //Elegir un objetivo aleatorio (ciudad o bateria)
        const objetivos = [...this.ciudades, ...this.baterias];
        const objetivosVivos = objetivos.filter(obj => {
            if (obj instanceof Ciudad) return obj.intacta;
            if (obj instanceof Bateria) return true;
            return false;
        });

        if (objetivosVivos.length > 0) {
            const objetivo = objetivosVivos[Math.floor(Math.random() * objetivosVivos.length)];
            const misil = new MisilEnemigo(inicioX, objetivo.x, objetivo.y);
            this.misilEnemigos.push(misil);
            this.misilesLanzados++;
        }
    }
}

// Creamos la instancia del juego
const juego = new Juego();

console.log('Juego listo')

// =======================
// EVENT LISTENERS
// =======================

// Hacemos click en el canvas para disparar
canvas.addEventListener('click', (evento) => {
    if (juego.estado === 'jugando'){
        //Obtenemos la posición del click relativa al canvas
        const rect = canvas.getBoundingClientRect(); // Rect es el rectangulo del canvas
        const clickX = evento.clientX - rect.left;
        const clickY = evento.clientY - rect.top;

        // Encontrar la bateria mas cercana
        let bateriaDisparar = null;
        let distanciaMinima = Infinity;

        for (const bateria of juego.baterias){
            if (bateria.puedeDisparar()){
                const distancia = Math.sqrt(
                    Math.pow(clickX - bateria.x, 2) +
                    Math.pow(clickY - bateria.y, 2)
                );

                if (distancia < distanciaMinima){
                    distanciaMinima = distancia;
                    bateriaDisparar = bateria;
                }
            }
        }

        // Disparar si hay alguna disponible
        if (bateriaDisparar){
            const misil = new MisilDefensa(
                bateriaDisparar.x,
                bateriaDisparar.y,
                clickX,
                clickY
            );
            juego.misilDefensas.push(misil)
            bateriaDisparar.disparar(clickX, clickY); // Actualizamos el contador de misiles
        }
    }
})

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


// =====================================
// CLASE BATERIA
// =====================================
class Bateria {
    constructor(x, y, misiles){
        this.x = x;
        this.y = y;
        this.ancho = 50;
        this.alto = 50;
        this.misilDisponibles = misiles; // Numero de misiles disponibles
        this.cooldown = 0; 
        this.tiempoCooldown = 200; // 2 segundos aprox de cooldown
    }
    puedeDisparar(){
        // Verificamos tanto si tiene misiles como si se ha acabado el cooldown
        return this.misilDisponibles > 0 && this.cooldown <= 0;
    }

    disparar(objetivoX, objetivoY){
        if (this.puedeDisparar()){
            this.misilDisponibles--;
            this.cooldown = this.tiempoCooldown;

            //TODO: Crear un misil y devolverlo
            return null; // Placeholder
        }
        return null;
    }

    actualizar(deltaTime){
        if (this.cooldown > 0){
            this.cooldown -= deltaTime;
        }
    }

    dibujar(ctx){
        // Configuramos los misiles
        const misilAncho = 8;
        const misilAlto = 20;
        const espacioMisil = 10;
        const filas = 2;
        const misilesPorFila = Math.ceil(this.misilDisponibles / filas); // Para que se distribuyan por las dos filas usamos la funcino ceiling y dividimos entre 2
        
        // Calculamos la posicion inicial para centrar los misiles
        const inicioX = this.x - (misilesPorFila * espacioMisil) / 2;

        // Dibujar cada misil disponible
        let misilDibujados = 0;
        for (let fila = 0; fila < filas && misilDibujados < this.misilDisponibles; fila++) {
            for (let col = 0; col < misilesPorFila && misilDibujados < this.misilDisponibles; col++) {
                const misilX = inicioX + (col * espacioMisil);
                const misilY = this.y - (fila * (misilAlto + 5));

                // Dibujamos el misil a partir del sprite
                ctx.drawImage(spriteMisil, misilX, misilY, misilAncho, misilAlto);
                misilDibujados++;
            }
        }
    }
            
}

// ================================
// CLASE MISILDEFENSA
// ================================
class MisilDefensa {
    constructor(inicioX, inicioY, objetivoX, objetivoY){
        this.x = inicioX;
        this.y = inicioY;
        this.objetivoX = objetivoX;
        this.objetivoY = objetivoY;
        this.velocidad = 0.3;
        this.llegado = false; // Para saber si ha llegado

        // Calcular la dirección del movimiento
        const dx = objetivoX - inicioX;
        const dy = objetivoY - inicioY;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Normalizamos la dirección
        this.dirX = dx / distancia;
        this.dirY = dy / distancia;
    }

    actualizar(deltaTime){
        if (!this.llegado){
            // Movemos el misil hacia el objetivo
            this.x += this.dirX * this.velocidad * deltaTime;
            this.y += this.dirY * this.velocidad * deltaTime;

            // Verificamos si ha llegado al objetivo usanfo distancia euclidea
            const distancia = Math.sqrt(
                Math.pow(this.objetivoX - this.x, 2) +
                Math.pow(this.objetivoY - this.y, 2)
            );

            if (distancia <5){ // No es lo mas preciso del mundo pero vale
                this.llegado = true;
            }
        }
    }

    dibujar(ctx){
        if (!this.llegado){
            // Dibujamos la estela del misil
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.objetivoX, this.objetivoY);
            ctx.stroke();

            // Calculamos el angulo de rotacion para que quede bien
            const angle = Math.atan2(this.dirY, this.dirX);

            // Dibujamos el sprite rotado
            ctx.save(); // Guardamos el estado actual
            ctx.translate(this.x, this.y);
            ctx.rotate(angle + Math.PI / 2); // Rotamos 90 grados para que apunte bien

            const misilAncho = 8;
            const misilAlto = 16;
            ctx.drawImage(spriteMisil, -misilAncho / 2, -misilAlto / 2, misilAncho, misilAlto);
            ctx.restore(); // Restauramos el estado anterior
        }
    }
}

// ================================
// CLASE EXPLOSION
// ================================
class Explosion {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.radioMaximo = 80;
        this.radioActual = 0;
        this.velocidadCrecimiento = 0.2; 
        this.duracion = 2000;
        this.tiempoVida = 0;
        this.activa = true;
    }

    actualizar(deltaTime){
        if (this.activa){
            this.tiempoVida += deltaTime;

            // Fase crecimiento
            if (this.tiempoVida < this.duracion / 2){
                this.radioActual += this.velocidadCrecimiento * deltaTime;
                if (this.radioActual > this.radioMaximo){
                    this.radioActual = this.radioMaximo;
                }
            }
            // Fase decrecimiento
            else {
                this.radioActual -= this.velocidadCrecimiento * deltaTime;
                if (this.radioActual < 0){
                    this.radioActual = 0;
                }
            }
            // Desactivar si ha terminado su vida
            if (this.tiempoVida >= this.duracion){
                this.activa = false;
            }
        }
    }

    dibujar(ctx){
        if (this.activa && this.radioActual > 0){
            // Calcular la opacidad basada en el tiempo de vida
            const opacidad = 1 - (this.tiempoVida / this.duracion);
            
            // Dibujar círculo exterior (amarillo)
            ctx.fillStyle = `rgba(255, 255, 0, ${opacidad * 0.6})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radioActual, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar círculo medio (naranja)
            ctx.fillStyle = `rgba(255, 165, 0, ${opacidad * 0.8})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radioActual * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar círculo interior (rojo)
            ctx.fillStyle = `rgba(255, 50, 0, ${opacidad})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radioActual * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Calculamos las colisiones con el punto usando distancias con el radio actual
    colisionaConPunto(x, y){
        const distancia = Math.sqrt(
            Math.pow(x - this.x, 2) +
            Math.pow(y - this.y, 2)
        );
        return distancia <= this.radioActual;
    }
}

// =====================================
// CLASE MISILENEMIGO
// =====================================
class MisilEnemigo{
    constructor(inicioX, objetivoX, objetivoY){
        this.x = inicioX;
        this.y = 0; // Siempre salen de arriba
        this.objetivoX = objetivoX;
        this.objetivoY = objetivoY;
        this.velocidad = 0.05;
        this.destruido = false;
        this.impacto = false;

        // Calcular la dirección del movimiento
        const dx = objetivoX - inicioX;
        const dy = objetivoY - this.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Normalizamos la dirección
        this.dirX = dx / distancia;
        this.dirY = dy / distancia;

        // Array para guardar la estela
        this.estela = [];
        this.maxEstela = 20; // Numero maximo de puntos en la estela

    }

    actualizar(deltaTime){
        if (!this.destruido && !this.impacto){
            // Guardamos posicion actual en la estela
            this.estela.push({x: this.x, y: this.y});
            if (this.estela.length > this.maxEstela){
                this.estela.shift(); // Eliminamos el punto mas antiguo
            }

            // Movemos el misil hacia el objetivo
            this.x += this.dirX * this.velocidad * deltaTime;
            this.y += this.dirY * this.velocidad * deltaTime;

            //Verificamos si ha llegado al objetivo
            const distancia = Math.sqrt(
                Math.pow(this.objetivoX - this.x, 2) +
                Math.pow(this.objetivoY - this.y, 2)
            );

            if (distancia <5){ // Sigue sin ser lo mas preciso del mundo lol
                this.impacto = true;
            }
        }
    }

    dibujar(ctx){
        if (!this.destruido && !this.impacto) {
            // Dibujar la estela (líneas rojas que se desvanecen)
            for (let i = 0; i < this.estela.length - 1; i++) {
                const opacidad = (i + 1) / this.estela.length;  // Se desvanece gradualmente
                ctx.strokeStyle = `rgba(255, 0, 0, ${opacidad})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.estela[i].x, this.estela[i].y);
                ctx.lineTo(this.estela[i + 1].x, this.estela[i + 1].y);
                ctx.stroke();
            }
            
            // Dibujar el misil enemigo
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar un punto brillante en el centro
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}