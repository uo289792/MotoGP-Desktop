class Noticias {
  constructor() {
      this.busqueda = "MotoGP";
      this.url = "https://api.thenewsapi.com/v1/news/all";
      this.apiKey = "JewnK4wW0Q63HNgkn4MRgfP56bYpXQ64iJoIxI6C";  
      this.noticias = [];    
  }

  buscar() {
      const llamada =
          `${this.url}?q=${encodeURIComponent(this.busqueda)}` +
          `&language=es&page_size=5&api_token=${this.apiKey}`;

      return fetch(llamada)
          .then(respuesta => {
              if (!respuesta.ok) {
                  throw new Error("Error HTTP " + respuesta.status);
              }
              return respuesta.json();
          });
  }

  procesarInformacion(json) {
      if (!json || !json.data) return;

      json.data.forEach(item => {
          this.noticias.push({
              titular: item.title || "",
              entradilla: item.description || "",
              enlace: item.url || "#",
              fuente: item.source || ""
          });
      });

      this.mostrarNoticias();
  }

  mostrarNoticias() {
      const section = $("<section></section>");
      section.attr("aria-label", "Noticias MotoGP");

      const h2 = $("<h2>Noticias sobre MotoGP</h2>");
      section.append(h2);

      this.noticias.forEach(noticia => {
          const article = $("<article></article>");
          const h3 = $("<h3></h3>");
          const enlace = $("<a></a>")
              .attr("href", noticia.enlace)
              .attr("target", "_blank")
              .attr("rel", "noopener noreferrer")
              .text(noticia.titular);

          const pEntradilla = $("<p></p>").text(noticia.entradilla);
          const pFuente = $("<p></p>").text("Fuente: " + noticia.fuente);

          h3.append(enlace);
          article.append(h3);
          article.append(pEntradilla);
          article.append(pFuente);

          section.append(article);
      });

      $("main").append(section);
  }

  init() {
      this.buscar()
          .then(this.procesarInformacion.bind(this))
          .catch(() => {
              $("main").append("<p>Error al cargar las noticias</p>");
          });
  }
}
