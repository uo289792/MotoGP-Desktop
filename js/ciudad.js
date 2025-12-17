class Ciudad {

  constructor(nombre, pais, gentilicio) {
    this._nombre = nombre;
    this._pais = pais;
    this._gentilicio = gentilicio;
    this._poblacion = null;
    this._coordenadas = { lat: null, lon: null };

    // Fechas de carrera y entrenamientos
    this.fechaCarrera = "2025-06-22";       // Carrera Mugello 2025
    this.fechaEntrenosInicio = "2025-06-19"; // 3 días previos
    this.fechaEntrenosFin = "2025-06-21";
  }

  initPoblacionYCoordenadas(poblacion, lat, lon) {
    this._poblacion = poblacion;
    this._coordenadas.lat = lat;
    this._coordenadas.lon = lon;
  }

  getNombre() { return String(this._nombre); }
  getPais() { return String(this._pais); }

  getInfoSecundariaHTML() {
    const gent = this._gentilicio ?? '';
    const pop = this._poblacion !== null ? this._poblacion.toLocaleString() : 'Desconocida';
    return `<ul>
      <li>Gentilicio: ${gent}</li>
      <li>Población: ${pop}</li>
    </ul>`;
  }

  writeCoordenadas() {
    if (this._coordenadas.lat === null || this._coordenadas.lon === null) {
      document.write('<p>Coordenadas: desconocidas</p>');
    } else {
      document.write(`<p>Coordenadas: lat ${this._coordenadas.lat}, lon ${this._coordenadas.lon}</p>`);
    }
  }

  getMeteorologiaCarrera() {
    const self = this;
    $.getJSON(
      "https://historical-forecast-api.open-meteo.com/v1/forecast",
      {
        latitude: this._coordenadas.lat,
        longitude: this._coordenadas.lon,
        hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,winddirection_10m",
        daily: "sunrise,sunset",
        start_date: this.fechaCarrera,
        end_date: this.fechaCarrera,
        timezone: "auto"
      },
      function (json) {
        const datos = self.procesarJSONCarrera(json);
        self.mostrarMeteorologiaCarrera(datos);
      }
    );
  }

  procesarJSONCarrera(json) {
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

  mostrarMeteorologiaCarrera(datos) {
    const section = $("<section></section>");
    section.append("<h3>Meteorología Carrera</h3>");
    const parrafo = $("<p></p>").text(
      `El día de la carrera, ${this.fechaCarrera}, el sol saldrá a las ${datos.amanecer} y se pondrá a las ${datos.atardecer}.`
    );

    section.append(parrafo);


    section.append("<h4>Condiciones a las 14:00 (inicio de carrera)</h4>");

    const idx14 = datos.horas.findIndex(h => h.endsWith("14:00"));

    if (idx14 !== -1) {
      const lista = $("<ul></ul>");
      lista.append("<li>Temperatura (2 m): " + datos.temperatura[idx14] + " °C</li>");
      lista.append("<li>Sensación térmica: " + datos.sensacion[idx14] + " °C</li>");
      lista.append("<li>Lluvia: " + datos.lluvia[idx14] + " mm</li>");
      lista.append("<li>Humedad relativa (2 m): " + datos.humedad[idx14] + " %</li>");
      lista.append("<li>Velocidad del viento (10 m): " + datos.viento[idx14] + " km/h</li>");
      lista.append("<li>Dirección del viento (10 m): " + datos.direccion[idx14] + " °</li>");
      section.append(lista);
    } else {
      section.append("<p>Datos horarios de la carrera no disponibles.</p>");
    }

    $("main").append(section);
  }

  getMeteorologiaEntrenos() {
    const self = this;
    $.getJSON(
      "https://historical-forecast-api.open-meteo.com/v1/forecast",
      {
        latitude: this._coordenadas.lat,
        longitude: this._coordenadas.lon,
        hourly: "temperature_2m,precipitation,relative_humidity_2m,windspeed_10m",
        start_date: this.fechaEntrenosInicio,
        end_date: this.fechaEntrenosFin,
        timezone: "auto"
      },
      function (json) {
        const datos = self.procesarJSONEntrenos(json);
        self.mostrarMeteorologiaEntrenos(datos);
      }
    );
  }

  procesarJSONEntrenos(json) {
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

  mostrarMeteorologiaEntrenos(datos) {
    const section = $("<section></section>");
    section.append("<h3>Meteorología Entrenamientos</h3>");

    datos.forEach(d => {
      section.append("<h4>Día " + d.dia + "</h4>");
      const lista = $("<ul></ul>");
      lista.append("<li>Temperatura media: " + d.temperatura + " °C</li>");
      lista.append("<li>Lluvia media: " + d.lluvia + " mm</li>");
      lista.append("<li>Humedad relativa media: " + d.humedad + " %</li>");
      lista.append("<li>Velocidad media del viento: " + d.viento + " km/h</li>");
      section.append(lista);
    });

    $("main").append(section);
  }

  writeInfo() {
    const section = document.createElement("section");
    section.innerHTML = `
      <h2>${this.getNombre()}</h2>
      <p>País: ${this.getPais()}</p>
      ${this.getInfoSecundariaHTML()}
    `;
    document.querySelector("main").appendChild(section);
    this.writeCoordenadas();
    this.getMeteorologiaCarrera();
    this.getMeteorologiaEntrenos(); 
  }
}
