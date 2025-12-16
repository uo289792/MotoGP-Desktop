// js/memoria.js

class Memoria {
  constructor() {
    // Atributos obligatorios por el guion
    this.tablero_bloqueado = true;  // true hasta inicializar y barajar
    this.primera_carta = null;
    this.segunda_carta = null;

    // referencia al cronómetro (se crea si existe la clase Cronometro)
    this.cronometro = null;

    // Inicialización del juego: barajar, desbloquear, crear cronómetro e iniciarlo
    this._inicializarJuego();
  }

  // Inicializa: baraja cartas, desbloquea tablero y arranca cronómetro
  _inicializarJuego() {
    // barajar (barajarCartas se encargará de no mover el h2 ni el párrafo del cronómetro)
    this.barajarCartas();

    // desbloquear tablero para jugar
    this.tablero_bloqueado = false;

    // crear cronómetro integrado si está disponible la clase
    try {
      if (typeof Cronometro !== 'undefined') {
        this.cronometro = new Cronometro();
      }
    } catch (e) {
      this.cronometro = null;
    }

    // arrancar cronómetro al finalizar la inicialización (si existe)
    if (this.cronometro && typeof this.cronometro.arrancar === 'function') {
      this.cronometro.arrancar();
    }
  }

  // Tarea 2: barajarCartas (Fisher-Yates)
  barajarCartas() {
    const main = document.querySelector('main');
    if (!main) return;

    // Tomamos sólo los elementos <article> dentro de main (evitamos h2 y p)
    const cartas = Array.from(main.querySelectorAll('article'));

    // Si no hay cartas, nada que hacer
    if (cartas.length === 0) return;

    // Mezclado Fisher-Yates
    for (let i = cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // swap en la array
      [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }

    // Reinsertar en el DOM en nuevo orden. Esto dejará h2 y p en su lugar,
    // porque hacemos appendChild sobre cada article (moviéndolos al final en el orden dado).
    // Esto es correcto siempre que h2 y p estén por delante de los article en main.
    for (const carta of cartas) {
      main.appendChild(carta);
    }
  }

  // Tarea 3: reiniciarAtributos (restablece estado entre intentos)
  reiniciarAtributos() {
    // desbloquea tablero para nuevas pulsaciones y borra referencias a cartas
    this.tablero_bloqueado = false;
    this.primera_carta = null;
    this.segunda_carta = null;
  }

  // Tarea 4: deshabilitarCartas (marcar como revelada y llamar a comprobaciones)
  deshabilitarCartas() {
    if (!this.primera_carta || !this.segunda_carta) {
      // nada que deshabilitar
      this.reiniciarAtributos();
      return;
    }

    // marcar ambas cartas como 'revelada'
    this.primera_carta.setAttribute('data-state', 'revelada');
    this.segunda_carta.setAttribute('data-state', 'revelada');

    // comprobar si el juego ha terminado antes de reiniciar atributos
    this.comprobarJuego();

    // reiniciar referencias para siguiente intento
    this.reiniciarAtributos();
  }

  // Tarea 5: comprobarJuego (si todas las cartas están reveladas se termina)
  comprobarJuego() {
    // Obtener todas las cartas
    const cartas = Array.from(document.querySelectorAll('main article'));
    // Si todas tienen data-estado === 'revelada' -> juego terminado
    const quedan = cartas.some(c => c.getAttribute('data-state') !== 'revelada');

    if (!quedan) {
      // todas emparejadas => juego finalizado
      // Parar el cronómetro (si existe)
      if (this.cronometro && typeof this.cronometro.parar === 'function') {
        this.cronometro.parar();
      }
      // Acción opcional: mostrar mensaje de finalización (no obligatorio)
      // alert('¡Juego completado!');
    }
  }

  // Ejercicio 3: cubrirCartas -> poner bocabajo las dos últimas cartas (si no coinciden)
  cubrirCartas() {
    // bloquear tablero mientras se cubren las cartas
    this.tablero_bloqueado = true;

    const first = this.primera_carta;
    const second = this.segunda_carta;

    // esperar para que el usuario vea las cartas (1.5s recomendado)
    setTimeout(() => {
      if (first && second) {
        first.removeAttribute('data-state'); // quitar atributo -> boca abajo
        second.removeAttribute('data-state');
      }
      // reiniciar atributos y desbloquear tablero
      this.reiniciarAtributos();
    }, 1500);
  }
  

  comprobarPareja() {
    // Aseguramos que existen ambas cartas
    if (!this.primera_carta || !this.segunda_carta) return;

    // Accedemos a la imagen interna (segundo hijo dentro del <article>)
    const img1 = this.primera_carta.children[1];
    const img2 = this.segunda_carta.children[1];

    // Comprobamos que existen ambas imágenes
    if (!img1 || !img2) return;

    // Obtenemos el atributo 'src' de cada imagen
    const src1 = img1.getAttribute('src');
    const src2 = img2.getAttribute('src');

    (src1 === src2) ? this.deshabilitarCartas() : this.cubrirCartas();
  }

  comprobarPareja() {
    if (!this.primera_carta || !this.segunda_carta) return;
    
    const img1 = this.primera_carta.querySelector('img');
    const img2 = this.segunda_carta.querySelector('img');
    const s1 = img1 ? img1.getAttribute('src') : null;
    const s2 = img2 ? img2.getAttribute('src') : null;
    (s1 !== null && s1 === s2) ? this.deshabilitarCartas() : this.cubrirCartas();
    
  }

  // Método principal: voltearCarta (llamado desde onclick="window.juegoMemoria.voltearCarta(this)")
  voltearCarta(carta) {
    // comprobaciones previas según enunciado:
    // - la carta no está deshabilitada (data-estado === 'revelada')
    // - la carta no está ya volteada (data-estado === 'volteada')
    // - el tablero no está bloqueado
    if (this.tablero_bloqueado) return;
    if (!carta || !(carta instanceof HTMLElement)) return;

    const estado = carta.getAttribute('data-state');
    if (estado === 'revelada' || estado === 'flip') return;

    // voltear la carta: poner atributo data-estado="volteada"
    carta.setAttribute('data-state', 'flip');

    // lógica de primera/segunda carta
    if (!this.primera_carta) {
      // primera carta del intento
      this.primera_carta = carta;
      return;
    }

    // si la misma carta se pulsa de nuevo, ignorar
    if (this.primera_carta === carta) return;

    // segunda carta
    this.segunda_carta = carta;

    // bloquear el tablero durante la comprobación para evitar clicks adicionales
    this.tablero_bloqueado = true;

    // comprobar pareja (este método decidirá si deshabilitar o cubrir)
    // comprobación puede invocar reinicios / desbloqueos según corresponda
    this.comprobarPareja();
  }
}
