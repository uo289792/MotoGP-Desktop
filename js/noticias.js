// js/noticias.js
class Noticias {
  constructor(apiKey) {
    this.busqueda = 'MotoGP';
    this.apiKey = apiKey || 'TU_THE_NEWS_API_KEY';
    this.base = 'https://api.thenewsapi.com/v1/news/all';
  }

  buscar() {
    // construye URL con parámetros: q=MotoGP, language=es, page_size=5
    const url = `${this.base}?q=${encodeURIComponent(this.busqueda)}&language=es&page_size=5&api_token=${this.apiKey}`;
    return fetch(url).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  procesarInformacion(json) {
    if (!json || !json.data) return [];
    // transformar en array de noticias con campo title, description, url, source
    return json.data.map(item => ({
      titular: item.title || '',
      entradilla: item.description || '',
      enlace: item.url || item.link || '#',
      fuente: (item.source && item.source.name) ? item.source.name : (item.source || '')
    }));
  }

  mostrarNoticias(selector) {
    this.buscar().then(json => {
      const noticias = this.procesarInformacion(json);
      const cont = document.querySelector(selector);
      if (!cont) return;
      if (noticias.length === 0) {
        cont.innerHTML = '<p>No se encontraron noticias.</p>';
        return;
      }
      // usar innerHTML para añadir las noticias
      const html = `<section aria-label="Noticias MotoGP">
        <h2>Noticias sobre MotoGP</h2>
        <ul>
          ${noticias.map(n => `<li>
            <h3><a href="${n.enlace}" target="_blank" rel="noopener noreferrer">${n.titular}</a></h3>
            <p>${n.entradilla}</p>
            <p class="fuente">Fuente: ${n.fuente}</p>
          </li>`).join('')}
        </ul>
      </section>`;
      cont.innerHTML = html;
    }).catch(err => {
      console.error('Error noticias:', err);
      const cont = document.querySelector(selector);
      if (cont) cont.innerHTML = `<p>Error al cargar noticias: ${err.message}</p>`;
    });
  }
}
