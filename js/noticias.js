class Noticias {
    #busqueda;
    #url;
    #apiKey;
    #noticias;

    constructor() {
        // Búsqueda avanzada: MotoGP y términos relacionados
        this.#busqueda = 'MotoGP+(motociclismo|"gran premio"|moto)';
        this.#url = "https://api.thenewsapi.com/v1/news/all";
        this.#apiKey = "J6r4hmVwFPvtFWs22RlJDOMnEUffh85oZB4Hs1Oa";
        this.#noticias = [];
    }

    buscar() {
        const params = new URLSearchParams({
            api_token: this.#apiKey,
            search: this.#busqueda,
            search_fields: "title,description,keywords",
            language: "es",
            categories: "sports",
            sort: "relevance",
            limit: 5
        });

        const llamada = `${this.#url}?${params.toString()}`;

        return fetch(llamada)
            .then(respuesta => {
                if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
                return respuesta.json();
            });
    }

    #procesarInformacion(json) {
        if (!json || !json.data) return;

        json.data.forEach(item => {
            this.#noticias.push({
                titular: item.title || "",
                entradilla: item.description || "",
                enlace: item.url || "#",
                fuente: item.source || ""
            });
        });

        this.#mostrarNoticias();
    }

    #mostrarNoticias() {
        const section = document.createElement('section');
        const h3 = document.createElement('h3');
        h3.textContent = "Noticias sobre MotoGP";
        section.appendChild(h3);

        this.#noticias.forEach(noticia => {
            const article = document.createElement('article');

            const h4 = document.createElement('h4');
            const enlace = document.createElement('a');
            enlace.href = noticia.enlace;
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";
            enlace.textContent = noticia.titular;
            h4.appendChild(enlace);

            const pEntradilla = document.createElement('p');
            pEntradilla.textContent = noticia.entradilla;

            const pFuente = document.createElement('p');
            pFuente.textContent = "Fuente: " + noticia.fuente;

            article.appendChild(h4);
            article.appendChild(pEntradilla);
            article.appendChild(pFuente);

            section.appendChild(article);
        });

        document.querySelector('main').appendChild(section);
    }

    init() {
        this.buscar()
            .then(this.#procesarInformacion.bind(this))
            .catch(() => {
                const p = document.createElement('p');
                p.textContent = "Error al cargar las noticias";
                document.querySelector('main').appendChild(p);
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const noticias = new Noticias();
    noticias.init();
});
