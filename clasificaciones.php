<?php
class Clasificacion {

    private string $ruta;

    public function __construct() {
        $this->ruta = __DIR__ . '/xml/circuitoEsquema.xml';
    }

    public function consultar(): ?SimpleXMLElement {
        if (!file_exists($this->ruta) || !is_readable($this->ruta)) {
            return null;
        }

        $xml = simplexml_load_file($this->ruta);
        if (!$xml) return null;

        $xml->registerXPathNamespace('u', 'http://www.uniovi.es');

        return $xml;
    }

    public function ganador($xml) {
        if (!$xml) return null;

        $res = $xml->xpath('//u:vencedor');
        return $res[0] ?? null;
    }

    public function mundial($xml) {
        if (!$xml) return [];

        $res = $xml->xpath('//u:puesto');
        return $res ?: [];
    }
}
?>

<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Clasificaciones del proyecto MotoGP-Desktop - en desarrollo" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, pilotos, circuito, clasificaciones" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MotoGP-Clasificaciones</title>

    <link rel="stylesheet" href="estilo/estilo.css" />
</head>
<body>
     <header>
        <h1>MotoGP Desktop</h1> 
        <nav aria-label="Menú principal">
            <a href="index.html" title="Inicio" class="active">Inicio</a>
            <a href="piloto.html" title="Información del piloto">Piloto</a>
            <a href="circuito.html" title="Información de circuitos">Circuito</a>
            <a href="meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="clasificaciones.php" title="Clasificaciones">Clasificaciones</a>
            <a href="juegos.html" title="Juegos">Juegos</a>
            <a href="ayuda.html" title="Ayuda del proyecto">Ayuda</a>
        </nav>
    </header>


    <p class="migas">Estás en: <a href="index.html">Inicio</a> >> Clasificaciones</p>

    <main>
        <section>
            <h2>Ganador de la carrera</h2>
            <?php
                $c = new Clasificacion();
                $xml = $c->consultar();
                $ganador = $c->ganador($xml);
                if ($ganador) {
                    echo "<p>Ganador: {$ganador->nombre}</p>";
                    echo "<p>Tiempo: {$ganador->tiempo} s</p>";
                } else {
                    echo "<p>No disponible.</p>";
                }
            ?>
        </section>

        <section>
            <h2>Clasificación del mundial tras la carrera</h2>
            <ol>
            <?php
                $puestos = $c->mundial($xml);
                foreach ($puestos as $p) {
                    $nombre = (string)$p->piloto;
                    $puntos = (string)$p['puntos']; 
                    echo "<li>{$nombre}: {$puntos} puntos</li>";
                }
            ?>
            </ol>
        </section>

    </main>
    
</body>
</html>
