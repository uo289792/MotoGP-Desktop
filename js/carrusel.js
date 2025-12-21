class Carrusel {
    #busqueda;
    #actual;
    #maximo;
    #fotografias;

    constructor() {
        this.#busqueda = "MotoGP, Mugello";
        this.#actual = 0;
        this.#maximo = 4;
        this.#fotografias = [];
    }

    getFotografias() {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

        // JSONP con jQuery
        $.getJSON(flickrAPI, {
            tags: this.#busqueda,
            tagmode: "all",
            format: "json"
        })
        .done(this.#procesarJSONFotografias.bind(this))
        .fail(() => {
            const p = $("<p></p>").text("Error al obtener las imágenes");
            $("main").append(p);
        });
    }

    #procesarJSONFotografias(data) {
        for (let i = 0; i <= this.#maximo; i++) {
            const foto = data.items[i];
            const url = foto.media.m.replace("_m.", "_b.");
            this.#fotografias.push({
                url,
                alt: "Imagen del circuito de Mugello (MotoGP)"
            });
        }
        this.#mostrarFotografias();
    }

    #mostrarFotografias() {
        if (this.#fotografias.length === 0) return;

        const section = $("<section></section>");
        const h3 = $("<h3>Imágenes del circuito de Mugello</h3>");
        const img = $("<img>")
            .attr("src", this.#fotografias[this.#actual].url)
            .attr("alt", this.#fotografias[this.#actual].alt);

        section.append(h3);
        section.append(img);
        $("main").append(section);

        setInterval(this.#cambiarFotografia.bind(this), 3000);
    }

    #cambiarFotografia() {
        this.#actual++;
        if (this.#actual > this.#maximo) this.#actual = 0;

        $("section img")
            .attr("src", this.#fotografias[this.#actual].url)
            .attr("alt", this.#fotografias[this.#actual].alt);
    }
}

$(document).ready(() => {
    const carrusel = new Carrusel();
    carrusel.getFotografias();
});
