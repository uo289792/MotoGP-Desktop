// Requiere jQuery 3.7.1

class Carrusel {

    constructor() {
        this.busqueda = "MotoGP Mugello Circuit";
        this.actual = 0;
        this.maximo = 4; // 5 imágenes (0..4)
        this.fotografias = [];
    }

    // TAREA 5: Obtener imágenes (JSONP, sin API key)
    getFotografias() {
        const flickrAPI =
            "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

        $.getJSON(flickrAPI, {
            tags: "MotoGP,Mugello",
            tagmode: "all",
            format: "json"
        })
        .done(this.procesarJSONFotografias.bind(this))
        .fail(() => {
            $("main").append("<p>Error al obtener las imágenes</p>");
        });
    }

    // TAREA 6: Procesar JSON (5 fotografías)
    procesarJSONFotografias(data) {
        for (let i = 0; i <= this.maximo; i++) {
            const foto = data.items[i];
            const url = foto.media.m.replace("_m.", "_b.");

            this.fotografias.push({
                url: url,
                alt: "Imagen del circuito de Mugello (MotoGP)"
            });
        }
        this.mostrarFotografias();
    }

    // TAREA 7: Mostrar primera imagen
    mostrarFotografias() {
        const article = $("<article></article>");
        const h2 = $("<h2>Imágenes del circuito de Mugello</h2>");
        const img = $("<img>")
            .attr("src", this.fotografias[this.actual].url)
            .attr("alt", this.fotografias[this.actual].alt);

        article.append(h2);
        article.append(img);

        $("main").append(article);

        // TAREA 8: Temporizador
        setInterval(this.cambiarFotografia.bind(this), 3000);
    }

    // TAREA 8: Cambio de imagen
    cambiarFotografia() {
        this.actual++;

        if (this.actual > this.maximo) {
            this.actual = 0;
        }

        $("article img")
            .attr("src", this.fotografias[this.actual].url)
            .attr("alt", this.fotografias[this.actual].alt);
    }
}
