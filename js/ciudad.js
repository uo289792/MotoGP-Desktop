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
}
