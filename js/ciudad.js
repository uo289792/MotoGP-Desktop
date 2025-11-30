class Ciudad {

  constructor(nombre, pais, gentilicio) {
    this._nombre = nombre;
    this._pais = pais;
    this._gentilicio = gentilicio;
    this._poblacion = null;        
    this._coordenadas = {lat: null, lon: null}; 
  }

  // método para rellenar el resto de atributos (población y coordenadas)
  initPoblacionYCoordenadas(poblacion, lat, lon) {
    this._poblacion = poblacion;
    this._coordenadas.lat = lat;
    this._coordenadas.lon = lon;
  }

  // devuelve el nombre de la ciudad como texto
  getNombre() {
    return String(this._nombre);
  }

  // devuelve el país como texto
  getPais() {
    return String(this._pais);
  }

  // devuelve la información secundaria (gentilicio y población) como una lista <ul> en una cadena
  getInfoSecundariaHTML() {
    const gent = this._gentilicio ?? '';
    const pop = this._poblacion !== null ? this._poblacion.toLocaleString() : 'Desconocida';
    return `<ul>
      <li>Gentilicio: ${gent}</li>
      <li>Población: ${pop}</li>
    </ul>`;
  }

  // escribe en el documento las coordenadas usando document.write() (según enunciado)
  writeCoordenadas() {
    if (this._coordenadas.lat === null || this._coordenadas.lon === null) {
      document.write('<p>Coordenadas: desconocidas</p>');
    } else {
      document.write(`<p>Coordenadas: lat ${this._coordenadas.lat}, lon ${this._coordenadas.lon}</p>`);
    }
  }

  getMeteorologiaCarrera() {
    const url = "https://historical-forecast-api.open-meteo.com/v1/forecast";

    return $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: {
            latitude: this._coordenadas.lat,
            longitude: this._coordenadas.lon,
            hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,winddirection_10m",
            daily: "sunrise,sunset",
            start_date: this.fechaCarrera,
            end_date: this.fechaCarrera,
            timezone: "auto"
        }
    });
}

// --- TAREA 4: Procesar JSON del día de carrera ---
procesarJSONCarrera(json) {
    return {
        horas: json.hourly.time,
        temp: json.hourly.temperature_2m,
        sensacion: json.hourly.apparent_temperature,
        lluvia: json.hourly.precipitation,
        humedad: json.hourly.relative_humidity_2m,
        viento: json.hourly.windspeed_10m,
        direccion: json.hourly.winddirection_10m,
        amanecer: json.daily.sunrise[0],
        atardecer: json.daily.sunset[0]
    };
}

// --- TAREA 6: Datos meteorológicos de entrenos (3 días previos) ---
getMeteorologiaEntrenos() {
    const url = "https://historical-forecast-api.open-meteo.com/v1/forecast";

    return $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: {
            latitude: this._coordenadas.lat,
            longitude: this._coordenadas.lon,
            hourly: "temperature_2m,precipitation,relative_humidity_2m,windspeed_10m",
            start_date: this.fechaEntrenosInicio,
            end_date: this.fechaEntrenosFin,
            timezone: "auto"
        }
    });
}

// --- TAREA 7: Procesar JSON de entrenos (medias por día) ---
procesarJSONEntrenos(json) {
    const dias = {};

    json.hourly.time.forEach((t, i) => {
        const dia = t.split("T")[0];
        if (!dias[dia]) {
            dias[dia] = {
                temp: [],
                lluvia: [],
                humedad: [],
                viento: []
            };
        }
        dias[dia].temp.push(json.hourly.temperature_2m[i]);
        dias[dia].lluvia.push(json.hourly.precipitation[i]);
        dias[dia].humedad.push(json.hourly.relative_humidity_2m[i]);
        dias[dia].viento.push(json.hourly.windspeed_10m[i]);
    });

    // medias de los 3 días
    const resultado = [];
    Object.keys(dias).forEach(d => {
        resultado.push({
            dia: d,
            temp: (dias[d].temp.reduce((a,b)=>a+b,0)/dias[d].temp.length).toFixed(2),
            lluvia: (dias[d].lluvia.reduce((a,b)=>a+b,0)/dias[d].lluvia.length).toFixed(2),
            humedad: (dias[d].humedad.reduce((a,b)=>a+b,0)/dias[d].humedad.length).toFixed(2),
            viento: (dias[d].viento.reduce((a,b)=>a+b,0)/dias[d].viento.length).toFixed(2)
        });
    });

    return resultado;
  }
}
