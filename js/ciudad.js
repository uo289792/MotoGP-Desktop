class Ciudad {
    // Atributos privados
    #nombre;
    #pais;
    #gentilicio;
    #poblacion = null;
    #coordenadas = { lat: null, lon: null };
    #fechaCarrera;
    #fechaEntrenosInicio;
    #fechaEntrenosFin;

    constructor(nombre, pais, gentilicio) {
        this.#nombre = nombre;
        this.#pais = pais;
        this.#gentilicio = gentilicio;

        // Fechas de carrera y entrenamientos
        this.#fechaCarrera = "2025-06-22";
        this.#fechaEntrenosInicio = "2025-06-19";
        this.#fechaEntrenosFin = "2025-06-21";
    }

    // Inicialización de población y coordenadas
    initPoblacionYCoordenadas(poblacion, lat, lon) {
        this.#poblacion = poblacion;
        this.#coordenadas.lat = lat;
        this.#coordenadas.lon = lon;
    }

    // Getters públicos
    getNombre() { return this.#nombre; }
    getPais() { return this.#pais; }

    // Genera HTML con información secundaria
    getInfoSecundariaHTML() {
        const pop = this.#poblacion !== null ? this.#poblacion.toLocaleString() : 'Desconocida';
        return `<ul>
            <li>Gentilicio: ${this.#gentilicio}</li>
            <li>Población: ${pop}</li>
        </ul>`;
    }

    // Mostrar coordenadas en el DOM
    writeCoordenadas() {
        const p = document.createElement('p');
        if (this.#coordenadas.lat === null || this.#coordenadas.lon === null) {
            p.textContent = 'Coordenadas: desconocidas';
        } else {
            p.textContent = `Coordenadas: lat ${this.#coordenadas.lat}, lon ${this.#coordenadas.lon}`;
        }
        document.querySelector('main').appendChild(p);
    }

    // Mostrar información completa de la ciudad
    writeInfo() {
        const section = document.createElement('section');
        section.innerHTML = `
            <h2>${this.getNombre()}</h2>
            <p>País: ${this.getPais()}</p>
            ${this.getInfoSecundariaHTML()}
        `;
        document.querySelector('main').appendChild(section);
        this.writeCoordenadas();
        this.getMeteorologiaCarrera();
        this.getMeteorologiaEntrenos();
    }

    // METEOROLOGÍA CARRERA
    async getMeteorologiaCarrera() {
        if (this.#coordenadas.lat === null || this.#coordenadas.lon === null) return;

        const url = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${this.#coordenadas.lat}&longitude=${this.#coordenadas.lon}&hourly=temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,winddirection_10m&daily=sunrise,sunset&start_date=${this.#fechaCarrera}&end_date=${this.#fechaCarrera}&timezone=auto`;

        try {
            const response = await fetch(url);
            const json = await response.json();
            const datos = this.#procesarJSONCarrera(json);
            this.#mostrarMeteorologiaCarrera(datos);
        } catch (error) {
            console.error("Error al obtener meteorología de carrera:", error);
        }
    }

    #procesarJSONCarrera(json) {
        const formatHora = s => s.split("T")[1].substring(0,5);
        return {
            horas: json.hourly.time,
            temperatura: json.hourly.temperature_2m,
            sensacion: json.hourly.apparent_temperature,
            lluvia: json.hourly.precipitation,
            humedad: json.hourly.relative_humidity_2m,
            viento: json.hourly.windspeed_10m,
            direccion: json.hourly.winddirection_10m,
            amanecer: formatHora(json.daily.sunrise[0]),
            atardecer: formatHora(json.daily.sunset[0])
        };
    }

    #mostrarMeteorologiaCarrera(datos) {
        const section = document.createElement('section');
        const h3 = document.createElement('h3');
        h3.textContent = "Meteorología Carrera";
        section.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = `El día de la carrera, ${this.#fechaCarrera}, el sol saldrá a las ${datos.amanecer} y se pondrá a las ${datos.atardecer}.`;
        section.appendChild(p);

        const idx14 = datos.horas.findIndex(h => h.endsWith("14:00"));
        if (idx14 !== -1) {
            const ul = document.createElement('ul');
            ul.innerHTML = `
                <li>Temperatura (2 m): ${datos.temperatura[idx14]} °C</li>
                <li>Sensación térmica: ${datos.sensacion[idx14]} °C</li>
                <li>Lluvia: ${datos.lluvia[idx14]} mm</li>
                <li>Humedad relativa (2 m): ${datos.humedad[idx14]} %</li>
                <li>Velocidad del viento (10 m): ${datos.viento[idx14]} km/h</li>
                <li>Dirección del viento (10 m): ${datos.direccion[idx14]} °</li>
            `;
            section.appendChild(ul);
        } else {
            const p2 = document.createElement('p');
            p2.textContent = 'Datos horarios de la carrera no disponibles.';
            section.appendChild(p2);
        }

        document.querySelector('main').appendChild(section);
    }

    // METEOROLOGÍA ENTRENOS
    async getMeteorologiaEntrenos() {
        if (this.#coordenadas.lat === null || this.#coordenadas.lon === null) return;

        const url = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${this.#coordenadas.lat}&longitude=${this.#coordenadas.lon}&hourly=temperature_2m,precipitation,relative_humidity_2m,windspeed_10m&start_date=${this.#fechaEntrenosInicio}&end_date=${this.#fechaEntrenosFin}&timezone=auto`;

        try {
            const response = await fetch(url);
            const json = await response.json();
            const datos = this.#procesarJSONEntrenos(json);
            this.#mostrarMeteorologiaEntrenos(datos);
        } catch (error) {
            console.error("Error al obtener meteorología de entrenos:", error);
        }
    }

    #procesarJSONEntrenos(json) {
        const dias = {};
        json.hourly.time.forEach((t, i) => {
            const dia = t.split("T")[0];
            if (!dias[dia]) dias[dia] = { temp: [], lluvia: [], humedad: [], viento: [] };

            dias[dia].temp.push(json.hourly.temperature_2m[i]);
            dias[dia].lluvia.push(json.hourly.precipitation[i]);
            dias[dia].humedad.push(json.hourly.relative_humidity_2m[i]);
            dias[dia].viento.push(json.hourly.windspeed_10m[i]);
        });

        const resultado = [];
        for (let d in dias) {
            resultado.push({
                dia: d,
                temperatura: (dias[d].temp.reduce((a,b)=>a+b,0)/dias[d].temp.length).toFixed(2),
                lluvia: (dias[d].lluvia.reduce((a,b)=>a+b,0)/dias[d].lluvia.length).toFixed(2),
                humedad: (dias[d].humedad.reduce((a,b)=>a+b,0)/dias[d].humedad.length).toFixed(2),
                viento: (dias[d].viento.reduce((a,b)=>a+b,0)/dias[d].viento.length).toFixed(2)
            });
        }
        return resultado;
    }

    #mostrarMeteorologiaEntrenos(datos) {
        const section = document.createElement('section');
        const h3 = document.createElement('h3');
        h3.textContent = "Meteorología Entrenamientos";
        section.appendChild(h3);

        datos.forEach(d => {
            const h4 = document.createElement('h4');
            h4.textContent = `Día ${d.dia}`;
            section.appendChild(h4);

            const ul = document.createElement('ul');
            ul.innerHTML = `
                <li>Temperatura media: ${d.temperatura} °C</li>
                <li>Lluvia media: ${d.lluvia} mm</li>
                <li>Humedad relativa media: ${d.humedad} %</li>
                <li>Velocidad media del viento: ${d.viento} km/h</li>
            `;
            section.appendChild(ul);
        });

        document.querySelector('main').appendChild(section);
    }
}
