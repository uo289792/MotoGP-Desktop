// js/circuito.js

class Circuito {
  constructor() {
    this.comprobarApiFile();
    window.addEventListener('DOMContentLoaded', () => {
      this.inicializarLecturaHTML();
      this.inicializarLecturaSVG();
      this.inicializarLecturaKML();
    });
  }

  comprobarApiFile() {
    const soportado = !!(window.File && window.FileReader && window.Blob);
    if (!soportado) {
      const main = document.querySelector('main');
      const aviso = document.createElement('p');
      aviso.textContent = 'Tu navegador no soporta API File de HTML5.';
      main.appendChild(aviso);
    }
  }

  // Ejercicio 1: InfoCircuito.html
  inicializarLecturaHTML() {
    const input = document.querySelector('section#info-circuito ~ section, section#info-circuito input[accept*="html"]') 
      || document.querySelector('section input[accept*="html"]');
    const destino = document.querySelector('section article[aria-label="Contenido del archivo InfoCircuito.html"]');
    if (!input || !destino) return;
    input.addEventListener('change', (e) => this.leerArchivoHTML(e, destino));
  }

  leerArchivoHTML(event, destino) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(reader.result, 'text/html');
      const contenido = doc.body ? doc.body.cloneNode(true) : null;
      destino.replaceChildren();

      if (contenido) {
        const fragment = document.createDocumentFragment();
        const section = document.createElement('section');
        section.setAttribute('role', 'document');
        [...contenido.children].forEach((node) => section.appendChild(node));
        fragment.appendChild(section);
        destino.appendChild(fragment);
      } else {
        const p = document.createElement('p');
        p.textContent = 'No se pudo interpretar el archivo HTML.';
        destino.appendChild(p);
      }
    };

    reader.onerror = () => {
      destino.textContent = 'Error leyendo el archivo HTML.';
    };

    reader.readAsText(file, 'utf-8');
  }

  // Ejercicio 2: altimetria.svg
  inicializarLecturaSVG() {
    const input = document.querySelector('section input[accept*="svg"]');
    const destino = document.querySelector('section figure section[aria-live="polite"]');
    if (!input || !destino) return;
    const cargador = new CargadorSVG(input, destino);
    cargador.inicializar();
  }

  // Ejercicio 3: KML + mapa
  inicializarLecturaKML() {
    const input = document.querySelector('section input[accept*="kml"]');
    const contenedorMapa = document.querySelector('section div[role="region"]');
    if (!input || !contenedorMapa) return;
    const kml = new CargadorKML(input, contenedorMapa);
    kml.inicializar();
  }
}

class CargadorSVG {
  constructor(inputEl, destinoEl) {
    this.input = inputEl;
    this.destino = destinoEl;
  }

  inicializar() {
    this.input.addEventListener('change', (e) => this.leerArchivoSVG(e));
  }

  leerArchivoSVG(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.insertarSVG(reader.result);
    reader.onerror = () => {
      this.destino.textContent = 'Error leyendo el archivo SVG.';
    };
    reader.readAsText(file, 'utf-8');
  }

  insertarSVG(svgText) {
    // Incrustar el SVG tal cual
    this.destino.innerHTML = svgText;
    // Opcional: asegurar que el SVG tenga role="img"
    const svgEl = this.destino.querySelector('svg');
    if (svgEl && !svgEl.hasAttribute('role')) {
      svgEl.setAttribute('role', 'img');
      svgEl.setAttribute('aria-label', 'Gráfico de altimetría');
    }
  }
}

class CargadorKML {
  constructor(inputEl, contenedorMapa) {
    this.input = inputEl;
    this.contenedorMapa = contenedorMapa;
    this.map = null;
  }

  inicializar() {
    // Inicializar mapa (centrado por defecto: Oviedo)
    this.map = new google.maps.Map(this.contenedorMapa, {
      center: { lat: 43.3614, lng: -5.8593 },
      zoom: 6,
      mapTypeId: 'terrain'
    });

    this.input.addEventListener('change', (e) => this.leerArchivoKML(e));
  }

  leerArchivoKML(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(reader.result, 'application/xml');

      // Extraer LineString coordinates
      const lineStrings = xml.getElementsByTagName('LineString');
      const coords = [];

      for (const ls of lineStrings) {
        const coordsEl = ls.getElementsByTagName('coordinates')[0];
        if (coordsEl && coordsEl.textContent) {
          const lines = coordsEl.textContent.trim().split(/\s+/);
          for (const line of lines) {
            const [lon, lat] = line.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lon)) {
              coords.push({ lat, lng: lon });
            }
          }
        }
      }

      // Marcador en el origen
      if (coords.length > 0) {
        new google.maps.marker.AdvancedMarkerElement({
          position: coords[0],
          map: this.map,
          title: 'Origen del circuito'
        });
      }

      // Polilínea del circuito
      if (coords.length > 1) {
        const poly = new google.maps.Polyline({
          path: coords,
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 0.85,
          strokeWeight: 3
        });
        poly.setMap(this.map);

        // Ajustar el mapa a la ruta
        const bounds = new google.maps.LatLngBounds();
        coords.forEach(c => bounds.extend(c));
        this.map.fitBounds(bounds);
      }
    };

    reader.onerror = () => {
      const p = document.createElement('p');
      p.textContent = 'Error leyendo el archivo KML.';
      this.contenedorMapa.insertAdjacentElement('afterend', p);
    };

    reader.readAsText(file, 'utf-8');
  }
}

// Instancia principal
new Circuito();
