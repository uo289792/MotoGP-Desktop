// js/carrusel.js
// Requiere jQuery 3.x

class Carrusel {

  constructor() {
    this.busqueda = "Autodromo Internazionale del Mugello";
    this.maximo = 5; 
    this.apiKey = "5a0e1b7a34bd3bb29b3a1acae0dbf70c";
    this.actual = 0;
    this.intervalo = 3000;
    this.timer = null;
  }

  // --- TAREA 1: Llamada AJAX a Flickr ---
  getFotografias() {
    return $.ajax({
      url: "https://api.flickr.com/services/rest/",
      method: "GET",
      data: {
        method: "flickr.photos.search",
        api_key: this.apiKey,
        text: this.busqueda,
        per_page: this.maximo,
        format: "json",
        nojsoncallback: 1
      }
    });
  }

  // --- TAREA 2: Procesar JSON ---
  procesarJSONFotografias(json) {
    if (!json?.photos?.photo) return [];

    return json.photos.photo.map(p => ({
      url: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_z.jpg`,
      title: p.title || ""
    }));
  }

  // --- TAREA 3: Mostrar imágenes con innerHTML ---
  mostrarFotografias(fotos) {
    const cont = document.querySelector("#carrusel-mugello");

    let html = "<article><h2>Imágenes del circuito de Mugello</h2><div class='carrusel'>";

    fotos.forEach((f, i) => {
      html += `<img src="${f.url}" alt="${f.title}" style="display:${i === 0 ? 'block' : 'none'}">`;
    });

    html += "</div></article>";

    cont.innerHTML = html;

    // --- TAREA 8: cambiar con temporizador + bind() (OBLIGATORIO) ---
    this.timer = setInterval(this.cambiarFotografia.bind(this), this.intervalo);
  }

  // --- TAREA 4: Cambiar de foto ---
  cambiarFotografia() {
    const imgs = document.querySelectorAll("#carrusel-mugello img");
    if (imgs.length === 0) return;

    imgs[this.actual].style.display = "none";
    this.actual = (this.actual + 1) % imgs.length;
    imgs[this.actual].style.display = "block";
  }

  // --- TAREA 5: Inicializar todo ---
  init() {
    this.getFotografias()
      .done(json => {
        const fotos = this.procesarJSONFotografias(json);
        if (fotos.length > 0) this.mostrarFotografias(fotos);
        else document.querySelector("#carrusel-mugello").innerHTML = "<p>No se han encontrado imágenes.</p>";
      })
      .fail(() => {
        document.querySelector("#carrusel-mugello").innerHTML = "<p>Error al obtener imágenes.</p>";
      });
  }
}
