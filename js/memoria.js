class Memoria {

  #bloqueado;
  #primera;
  #segunda;
  #cronometro;

  constructor() {
    this.#bloqueado = true;
    this.#primera = null;
    this.#segunda = null;
    this.#cronometro = null;

    this.#inicializar();
  }

  #inicializar() {
    this.#barajar();
    this.#asignarEventos();

    if (typeof Cronometro !== "undefined") {
      this.#cronometro = new Cronometro();
      this.#cronometro.arrancar();
    }

    this.#bloqueado = false;
  }

  #asignarEventos() {
    document.querySelectorAll("main article").forEach(carta => {
      const h3 = carta.querySelector("h3");
      if (h3) h3.textContent = "Memory Card";

      carta.addEventListener("click", () => this.#clickCarta(carta));
    });
  }

  #clickCarta(carta) {

    if (this.#bloqueado) return;
    if (carta.getAttribute("data-state")) return;

    const abiertas = document.querySelectorAll(
      'main article[data-state="flip"]'
    );
    if (abiertas.length >= 2) return;

    carta.setAttribute("data-state", "flip");

    if (!this.#primera) {
      this.#primera = carta;
      return;
    }

    this.#segunda = carta;
    this.#bloqueado = true;

    this.#comprobarPareja();
  }

  #comprobarPareja() {
    const img1 = this.#primera.querySelector("img");
    const img2 = this.#segunda.querySelector("img");

    const s1 = img1.getAttribute("src");
    const s2 = img2.getAttribute("src");

    (s1 === s2) ? this.#deshabilitar() : this.#cubrir();
  }

  #deshabilitar() {
    this.#primera.setAttribute("data-state", "revelada");
    this.#segunda.setAttribute("data-state", "revelada");

    this.#finJuego();
    this.#resetTurno();
  }

  #cubrir() {
    setTimeout(() => {
      this.#primera.removeAttribute("data-state");
      this.#segunda.removeAttribute("data-state");
      this.#resetTurno();
    }, 1500);
  }

  #resetTurno() {
    this.#primera = null;
    this.#segunda = null;
    this.#bloqueado = false;
  }

  #finJuego() {
    const cartas = document.querySelectorAll("main article");
    const quedan = [...cartas].some(
      c => c.getAttribute("data-state") !== "revelada"
    );

    if (!quedan && this.#cronometro) {
      this.#cronometro.parar();
    }
  }

  #barajar() {
    const main = document.querySelector("main");
    const cartas = [...main.querySelectorAll("article")];

    for (let i = cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }

    cartas.forEach(c => main.appendChild(c));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.juegoMemoria = new Memoria();
});
