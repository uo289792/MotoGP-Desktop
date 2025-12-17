class Circuito {
  constructor() {
    this.comprobarApiFile();
    window.addEventListener('DOMContentLoaded', () => {
      this.inicializarLecturaHTML();
      this.inicializarLecturaSVG();
    });
  }

  comprobarApiFile() {
    if (!(window.File && window.FileReader && window.Blob)) {
      document.querySelector('main').insertAdjacentHTML('beforeend',
        '<p>Tu navegador no soporta API File de HTML5.</p>');
    }
  }

  // Ejercicio 1: InfoCircuito.html
  inicializarLecturaHTML() {
    const input = document.querySelector('section input[accept*="html"]');
    const destino = document.querySelector('section article[aria-live="polite"]');
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
      destino.innerHTML = '';
      if (doc.body) destino.appendChild(doc.body.cloneNode(true));
      else destino.textContent = 'No se pudo interpretar el archivo HTML.';
    };
    reader.onerror = () => { destino.textContent = 'Error leyendo el archivo HTML.'; };
    reader.readAsText(file, 'utf-8');
  }

  // Ejercicio 2: altimetria.svg
  inicializarLecturaSVG() {
    const input = document.querySelector('section input[accept*="svg"]');
    const destino = document.querySelector('figure section[aria-live="polite"]');
    if (!input || !destino) return;
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { destino.innerHTML = reader.result; };
      reader.onerror = () => { destino.textContent = 'Error leyendo el archivo SVG.'; };
      reader.readAsText(file, 'utf-8');
    });
  }
}

// Ejercicio 3: KML y mapa
class CargadorKML {
  constructor(inputEl, contenedorMapa) {
    this.input = inputEl;
    this.contenedorMapa = contenedorMapa;
    this.map = null;
  }

  inicializar() {
    this.input.addEventListener('change', (e) => this.leerArchivoKML(e));
  }

  leerArchivoKML(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(reader.result, 'application/xml');
      const coords = [];

      const lineStrings = xml.getElementsByTagName('LineString');
      for (const ls of lineStrings) {
        const c = ls.getElementsByTagName('coordinates')[0];
        if (c) {
          const lines = c.textContent.trim().split(/\s+/);
          for (const line of lines) {
            const [lon, lat] = line.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lon)) coords.push({ lat, lng: lon });
          }
        }
      }

      // Obtener origen desde KML
      const puntos = xml.getElementsByTagName('Point');
      let centro = coords[0];
      if (puntos.length > 0) {
        const origenCoord = puntos[0].getElementsByTagName('coordinates')[0].textContent.trim().split(',');
        centro = { lat: parseFloat(origenCoord[1]), lng: parseFloat(origenCoord[0]) };
      }

      // Inicializar mapa centrado en el origen
      this.map = new google.maps.Map(this.contenedorMapa, {
        center: centro,
        zoom: 16,
        mapTypeId: 'terrain'
      });

      // Marcador en origen
      new google.maps.marker.AdvancedMarkerElement({
        position: centro,
        map: this.map,
        title: 'Origen del circuito'
      });

      // Línea del circuito
      if (coords.length > 1) {
        const poly = new google.maps.Polyline({
          path: coords,
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 0.85,
          strokeWeight: 3
        });
        poly.setMap(this.map);

        // Ajustar mapa al recorrido
        const bounds = new google.maps.LatLngBounds();
        coords.forEach(c => bounds.extend(c));
        this.map.fitBounds(bounds);
      }
    };

    reader.onerror = () => {
      alert('Error leyendo el archivo KML.');
    };

    reader.readAsText(file, 'utf-8');
  }
}

// Inicializar la clase Circuito
new Circuito();

// Función global llamada por Google Maps
function initMap() {
  const inputKML = document.querySelector('section input[accept*="kml"]');
  const contenedorMapa = document.querySelector('section div[role="region"]');
  if (inputKML && contenedorMapa) {
    const cargador = new CargadorKML(inputKML, contenedorMapa);
    cargador.inicializar();
  }
}
