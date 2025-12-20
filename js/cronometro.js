class Cronometro {

    #tiempo;
    #inicio;
    #corriendo;
    #display;

    #btnArrancar;
    #btnParar;
    #btnReiniciar;

    constructor() {
        this.#tiempo = 0;
        this.#inicio = null;
        this.#corriendo = null;

        this.#btnArrancar = null;
        this.#btnParar = null;
        this.#btnReiniciar = null;

        const seccion = document.querySelector('main section');

        if (seccion) {
            this.#display = seccion.querySelector('p');
            const botones = seccion.querySelectorAll('button');
            [this.#btnArrancar, this.#btnParar, this.#btnReiniciar] = botones;

            if (this.#btnArrancar)
                this.#btnArrancar.addEventListener('click', () => this.arrancar());

            if (this.#btnParar)
                this.#btnParar.addEventListener('click', () => this.parar());

            if (this.#btnReiniciar)
                this.#btnReiniciar.addEventListener('click', () => this.reiniciar());
        } else {
            const main = document.querySelector('main');
            this.#display = main ? main.querySelector('p') : null;
        }

        this.#mostrar();
    }

    /* ===== MÉTODOS PÚBLICOS ===== */

    arrancar() {
        if (this.#corriendo) return;
        this.#inicio = Date.now() - this.#tiempo;
        this.#corriendo = setInterval(() => this.#actualizar(), 100);
    }

    parar() {
        if (!this.#corriendo) return;
        clearInterval(this.#corriendo);
        this.#corriendo = null;
    }

    reiniciar() {
        this.parar();
        this.#tiempo = 0;
        this.#inicio = null;
        this.#mostrar();
    }

    /* ===== MÉTODOS PRIVADOS ===== */

    #actualizar() {
        this.#tiempo = Date.now() - this.#inicio;
        this.#mostrar();
    }

    #mostrar() {
        if (!this.#display) return;

        const t = this.#tiempo;
        const min = String(Math.floor(t / 60000)).padStart(2, '0');
        const sec = String(Math.floor((t % 60000) / 1000)).padStart(2, '0');
        const dec = String(Math.floor((t % 1000) / 100));

        this.#display.textContent = `${min}:${sec}.${dec}`;
    }
}

/* Inicialización automática */
document.addEventListener('DOMContentLoaded', () => {
    window.cronometro = new Cronometro();
});
