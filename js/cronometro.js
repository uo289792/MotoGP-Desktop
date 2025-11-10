class Cronometro {
  constructor() {
    // tiempo transcurrido en milisegundos
    this.tiempo = 0;
    // instante inicial (Temporal.Instant o Date)
    this.inicio = null;
    // identificador del setInterval
    this.corriendo = null;
    // indicador si usamos Temporal
    this._usaTemporal = false;
  }

  // arrancar: guarda inicio (Temporal o Date), lanza actualizar periódicamente (0.1s)
  arrancar() {
    // si ya estaba corriendo, evitar duplicar intervalos
    if (this.corriendo !== null) return;

    try {
      // intenta usar Temporal (si está disponible en el entorno)
      if (typeof Temporal !== 'undefined' && Temporal && Temporal.Now && typeof Temporal.Now.instant === 'function') {
        this.inicio = Temporal.Now.instant(); // Temporal.Instant
        this._usaTemporal = true;
      } else {
        throw new Error('Temporal no disponible');
      }
    } catch (e) {
      // fallback a Date
      this.inicio = new Date();
      this._usaTemporal = false;
    }

    // forzamos primera visualización inmediatamente
    this.actualizar();

    // actualizamos cada décima de segundo (100 ms)
    this.corriendo = setInterval(this.actualizar.bind(this), 100);
  }

  // actualizar: calcula tiempo transcurrido (ms) y lo guarda en this.tiempo
  actualizar() {
    let nowMs;
    if (this._usaTemporal) {
      // Temporal.Instant -> epochMilliseconds (número entero)
      // Temporal.Now.instant().epochMilliseconds es estándar según Temporal spec / MDN
      nowMs = Temporal.Now.instant().epochMilliseconds;
      const inicioMs = this.inicio.epochMilliseconds;
      this.tiempo = nowMs - inicioMs;
    } else {
      nowMs = Date.now();
      const inicioMs = this.inicio.getTime();
      this.tiempo = nowMs - inicioMs;
    }

    // actualizamos la interfaz visual (primer párrafo dentro de main)
    this.mostrar();
  }

  // mostrar: formato mm:ss.s (mm 2 dígitos, ss 2 dígitos, .s = décima)
  mostrar() {
    // tiempo en ms
    const t = parseInt(this.tiempo, 10);

    // minutos
    const minutos = parseInt(t / 60000, 10);
    // segundos restantes
    const segundos = parseInt((t % 60000) / 1000, 10);
    // décima de segundo (1 dígito)
    const decima = parseInt((t % 1000) / 100, 10);

    // construimos cadena mm:ss.s
    const mm = String(minutos).padStart(2, '0');
    const ss = String(segundos).padStart(2, '0');
    const texto = `${mm}:${ss}.${decima}`;

    // insertamos en el primer párrafo dentro de <main>
    const p = document.querySelector('main p');
    if (p) {
      p.textContent = texto;
    }
  }

  // parar: detener intervalos
  parar() {
    if (this.corriendo !== null) {
      clearInterval(this.corriendo);
      this.corriendo = null;
    }
  }

  // reiniciar: detener, poner tiempo a 0 y mostrar
  reiniciar() {
    if (this.corriendo !== null) {
      clearInterval(this.corriendo);
      this.corriendo = null;
    }
    this.tiempo = 0;
    // para mantener consistencia, reiniciamos inicio también
    this.inicio = null;
    this.mostrar();
  }
}
