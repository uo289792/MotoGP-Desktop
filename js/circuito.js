class Circuito {
    constructor() {
        this.mapa = null;
        this.inicializarMapa();
        this.inicializarLecturaHTML();
        this.inicializarLecturaSVG();
        this.inicializarKML();
    }

    inicializarLecturaHTML() {
        const input = document.querySelector('section input[accept*="html"]');
        const destino = document.querySelector('section article');
        input?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(reader.result, 'text/html');
                destino.innerHTML = '';
                if (doc.body) destino.appendChild(doc.body.cloneNode(true));
            };
            reader.readAsText(file);
        });
    }

    inicializarLecturaSVG() {
        const input = document.querySelector('section input[accept*="svg"]');
        const figura = document.querySelector('section figure');
        input?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                figura.innerHTML = '';
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(reader.result, 'image/svg+xml');
                const svg = svgDoc.querySelector('svg');
                if (svg) {
                    figura.appendChild(svg);
                    const caption = document.createElement('figcaption');
                    caption.textContent = 'Gráfico de altimetría cargado desde archivo SVG';
                    figura.appendChild(caption);
                }
            };
            reader.readAsText(file);
        });
    }

    inicializarMapa() {
        const mapDiv = document.querySelector('main section:last-of-type div');
        this.mapa = new google.maps.Map(mapDiv, {
            center: { lat: 43.36727, lng: -5.85025 },
            zoom: 15,
            mapTypeId: 'terrain'
        });
    }

    inicializarKML() {
        const input = document.querySelector('section input[accept*="kml"]');
        input?.addEventListener('change', e => this.cargarKML(e));
    }

    cargarKML(event) {
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
                if (coords) {
                    const lines = coords.textContent.trim().split(/\s+/);
                    for (const line of lines) {
                        const [lon, lat] = line.split(',').map(Number);
                        if (!isNaN(lat) && !isNaN(lon)) coordenadas.push({ lat, lng: lon });
                    }
                }
            }

            if (coordenadas.length > 1) coordenadas.push(coordenadas[0]);

            const origen = coordenadas[0];
            new google.maps.Marker({ position: origen, map: this.mapa, title: 'Origen del circuito' });

            new google.maps.Polyline({
                path: coordenadas,
                geodesic: true,
                strokeColor: '#ff0000',
                strokeOpacity: 0.85,
                strokeWeight: 3,
                map: this.mapa
            });

            const bounds = new google.maps.LatLngBounds();
            coordenadas.forEach(c => bounds.extend(c));
            this.mapa.fitBounds(bounds);
        };
        reader.readAsText(file);
    }
}

window.initMap = () => new Circuito();
