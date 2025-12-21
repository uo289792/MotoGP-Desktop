class Circuito {

    #inputHTML;
    #inputSVG;
    #inputKML;

    #cargadorSVG;
    #cargadorKML;

    constructor() {
        this.comprobarApiFile();

        const seccionHTML = document.querySelector('main > section:nth-of-type(1)');
        this.#inputHTML = seccionHTML.querySelector('input[accept*="html"]');

        const seccionSVG = document.querySelector('main > section:nth-of-type(2)');
        this.#inputSVG = seccionSVG.querySelector('input[accept*="svg"]');

        const seccionMapa = document.querySelector('main > section:nth-of-type(3)');
        this.#inputKML = seccionMapa.querySelector('input[accept*="kml"]');

        this.#cargadorSVG = new CargadorSVG(
            seccionSVG.querySelector('figure')
        );

        this.#cargadorKML = new CargadorKML(
            seccionMapa.querySelector('div')
        );

        this.#inicializarEventos();
    }

    comprobarApiFile() {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            const p = document.createElement('p');
            p.textContent = 'El navegador no soporta la API File.';
            document.querySelector('main').appendChild(p);
            throw new Error('API File no soportada');
        }
    }

    #inicializarEventos() {
        this.#inputHTML.addEventListener(
            'change',
            e => this.leerArchivoHTML(e)
        );

        this.#inputSVG.addEventListener(
            'change',
            e => this.#cargadorSVG.leerArchivoSVG(e)
        );

        this.#inputKML.addEventListener(
            'change',
            e => this.#cargadorKML.leerArchivoKML(e)
        );
    }

    leerArchivoHTML(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(reader.result, 'text/html');
            const main = doc.querySelector('main');
            if (!main) return;

            let nodo = this.#inputHTML.nextElementSibling;
            while (nodo && nodo.tagName === 'SECTION') {
                const siguiente = nodo.nextElementSibling;
                nodo.remove();
                nodo = siguiente;
            }

            main.querySelectorAll('[src]').forEach(el =>
                el.setAttribute(
                    'src',
                    el.getAttribute('src').replace(/^(\.\.\/)+/, '')
                )
            );

            main.querySelectorAll('[href]').forEach(el =>
                el.setAttribute(
                    'href',
                    el.getAttribute('href').replace(/^(\.\.\/)+/, '')
                )
            );

            let ref = this.#inputHTML;
            main.querySelectorAll(':scope > section').forEach(section => {
                const clon = section.cloneNode(true);
                ref.insertAdjacentElement('afterend', clon);
                ref = clon;
            });
        };

        reader.readAsText(file);
    }
}

/* ===================================================== */

class CargadorSVG {

    #figura;

    constructor(figura) {
        this.#figura = figura;
    }

    leerArchivoSVG(event) {
        const archivo = event.target.files[0];
        if (!archivo || !archivo.type.match(/svg.*/)) return;

        this.#figura
            .querySelectorAll('svg, p, figcaption')
            .forEach(e => e.remove());

        const lector = new FileReader();
        lector.onload = () => this.insertarSVG(lector.result);
        lector.readAsText(archivo);
    }

    insertarSVG(contenido) {
        const limpio = contenido.replace(/<\?xml.*?\?>/, '');
        const parser = new DOMParser();
        const doc = parser.parseFromString(limpio, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return;

        svg.setAttribute('viewBox', '0 0 1000 500');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        this.#figura.appendChild(svg);

        const caption = document.createElement('figcaption');
        caption.textContent = 'Gráfico de altimetría del circuito';
        this.#figura.appendChild(caption);
    }
}

/* ===================================================== */

class CargadorKML {

    #mapa;
    #contenedor;
    #ruta;

    constructor(divMapa) {
        this.#contenedor = divMapa;
        this.#inicializarMapa();
    }

    #inicializarMapa() {
        this.#mapa = new google.maps.Map(this.#contenedor, {
            center: { lat: 43.36727, lng: -5.85025 },
            zoom: 15,
            mapTypeId: 'terrain'
        });
    }

    leerArchivoKML(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => this.insertarCapaKML(reader.result);
        reader.readAsText(file);
    }

    insertarCapaKML(texto) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(texto, 'application/xml');

        const coordenadas = [];

        xml.querySelectorAll('LineString coordinates').forEach(nodo => {
            nodo.textContent.trim().split(/\s+/).forEach(punto => {
                const [lon, lat] = punto.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lon)) {
                    coordenadas.push({ lat, lng: lon });
                }
            });
        });

        if (coordenadas.length > 1) {
            coordenadas.push(coordenadas[0]);
        }

        if (this.#ruta) {
            this.#ruta.setMap(null);
        }

        this.#ruta = new google.maps.Polyline({
            path: coordenadas,
            geodesic: true,
            strokeColor: '#ff0000',
            strokeOpacity: 0.85,
            strokeWeight: 3,
            map: this.#mapa
        });

        const bounds = new google.maps.LatLngBounds();
        coordenadas.forEach(c => bounds.extend(c));
        this.#mapa.fitBounds(bounds);
    }
}

/* ===================================================== */
/* Inicialización exigida por Google Maps */

window.initMap = () => new Circuito();