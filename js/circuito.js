class Circuito {

    #mapa;
    #inputHTML;
    #destinoHTML;
    #inputSVG;
    #figuraSVG;
    #inputKML;
    #mapaDiv;

    constructor() {
        const seccionHTML = document.querySelector('main > section:nth-of-type(1)');
        this.#inputHTML = seccionHTML.querySelector('input[accept*="html"]');
        this.#destinoHTML = document.createElement('article');
        this.#inputHTML.insertAdjacentElement('afterend', this.#destinoHTML);

        const seccionSVG = document.querySelector('main > section:nth-of-type(2)');
        this.#inputSVG = seccionSVG.querySelector('input[accept*="svg"]');
        this.#figuraSVG = seccionSVG.querySelector('figure');

        const seccionMapa = document.querySelector('main > section:nth-of-type(3)');
        this.#inputKML = seccionMapa.querySelector('input[accept*="kml"]');
        this.#mapaDiv = seccionMapa.querySelector('div');

        this.#inicializarMapa();
        this.#inicializarLecturaHTML();
        this.#inicializarLecturaSVG();
        this.#inicializarKML();
    }

    /* ================= HTML ================= */

    #inicializarLecturaHTML() {
        this.#inputHTML?.addEventListener('change', e => this.#cargarHTML(e));
    }

    #cargarHTML(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(reader.result, 'text/html');

            this.#destinoHTML.innerHTML = '';

            const main = doc.querySelector('main');
            if (!main) return;

            /* Corregir rutas: eliminar ../ */
            main.querySelectorAll('[src]').forEach(el => {
                el.setAttribute(
                    'src',
                    el.getAttribute('src').replace(/^(\.\.\/)+/, '')
                );
            });

            main.querySelectorAll('[href]').forEach(el => {
                el.setAttribute(
                    'href',
                    el.getAttribute('href').replace(/^(\.\.\/)+/, '')
                );
            });

            /* Insertar solo el contenido del main */
            this.#destinoHTML.appendChild(main.cloneNode(true));
        };

        reader.readAsText(file);
    }


    /* ================= SVG ================= */

    #inicializarLecturaSVG() {
        this.#inputSVG?.addEventListener('change', e => this.#cargarSVG(e));
    }

    #cargarSVG(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        /* Limpiar contenido previo */
        this.#figuraSVG.querySelectorAll('svg, p').forEach(e => e.remove());

        /* Comprobación de tipo */
        if (!archivo.type.match(/svg.*/)) {
            const p = document.createElement('p');
            p.textContent = 'Error: El archivo seleccionado no es un SVG válido.';
            this.#figuraSVG.appendChild(p);
            return;
        }

        const lector = new FileReader();

        lector.onload = () => {
            /* Eliminar cabecera XML si existe */
            const contenido = lector.result.replace(/<\?xml.*?\?>/, '');

            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(contenido, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');

            if (!svg) return;

            svg.setAttribute('viewBox', '0 0 1000 500');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            this.#figuraSVG.appendChild(svg);

            const caption = document.createElement('figcaption');
            caption.textContent = 'Gráfico de altimetría cargado desde archivo SVG';
            this.#figuraSVG.appendChild(caption);
        };

        lector.readAsText(archivo);
    }



    /* ================= MAPA ================= */

    #inicializarMapa() {
        this.#mapa = new google.maps.Map(this.#mapaDiv, {
            center: { lat: 43.36727, lng: -5.85025 },
            zoom: 15,
            mapTypeId: 'terrain'
        });
    }

    #inicializarKML() {
        this.#inputKML?.addEventListener('change', e => this.#cargarKML(e));
    }

    #cargarKML(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(reader.result, 'application/xml');

            const coordenadas = [];
            const lineStrings = xml.getElementsByTagName('LineString');

            for (const ls of lineStrings) {
                const coords = ls.getElementsByTagName('coordinates')[0];
                if (!coords) continue;

                const puntos = coords.textContent.trim().split(/\s+/);
                for (const punto of puntos) {
                    const [lon, lat] = punto.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        coordenadas.push({ lat, lng: lon });
                    }
                }
            }

            if (coordenadas.length > 1) {
                coordenadas.push(coordenadas[0]);
            }

            const origen = coordenadas[0];
            new google.maps.Marker({
                position: origen,
                map: this.#mapa,
                title: 'Origen del circuito'
            });

            new google.maps.Polyline({
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
        };
        reader.readAsText(file);
    }
}

/* Inicialización requerida por Google Maps */
window.initMap = () => new Circuito();
