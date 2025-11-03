// js/memoria.js

class Memoria {
  constructor() {
    // Constructor vacío (no recibe parámetros)
  }

  // Método voltearCarta que recibe la carta (article) como parámetro
  voltearCarta(carta) {
    // Añade el atributo data-estado="volteada" a la carta clicada
    if (carta && carta instanceof HTMLElement) {
      carta.dataset.state = "flip";
    }
  }
}
