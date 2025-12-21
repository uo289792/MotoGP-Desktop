<?php
class Clasificacion {

    private string $ruta;

    public function __construct() {
        $this->ruta = __DIR__ . '/xml/circuitoEsquema.xml';
    }

    // Devuelve los datos del XML como SimpleXMLElement, si existe
    private function cargarXML(): ?SimpleXMLElement {
        if (!file_exists($this->ruta) || !is_readable($this->ruta)) {
            return null;
        }
        $xml = simplexml_load_file($this->ruta);
        if (!$xml) return null;

        $xml->registerXPathNamespace('u', 'http://www.uniovi.es');
        return $xml;
    }

    // Devuelve un array con los datos del ganador
    public function obtenerGanador(): ?array {
        $xml = $this->cargarXML();
        if (!$xml) return null;

        $res = $xml->xpath('//u:vencedor');
        if (!$res || !isset($res[0])) return null;

        $ganador = $res[0];
        return [
            'nombre' => (string)$ganador->nombre,
            'tiempo'  => (string)$ganador->tiempo
        ];
    }

    // Devuelve un array con la clasificación del mundial
    public function obtenerMundial(): array {
        $xml = $this->cargarXML();
        if (!$xml) return [];

        $res = $xml->xpath('//u:puesto');
        $puestos = [];
        if ($res) {
            foreach ($res as $p) {
                $puestos[] = [
                    'piloto' => (string)$p->piloto,
                    'puntos' => (string)$p['puntos']
                ];
            }
        }
        return $puestos;
    }
}
?>

<?php
    $c = new Clasificacion();
    $ganador = $c->obtenerGanador();
    $puestos  = $c->obtenerMundial();
?>

<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Clasificaciones del proyecto MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, pilotos, circuito, clasificaciones" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MotoGP-Clasificaciones</title>

    <link rel="stylesheet" href="estilo/estilo.css" />
    <link rel="stylesheet" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/favicon.ico" type="image/x-icon">
</head>
<body>
     <header>
        <h1><a href="index.html">MotoGP Desktop</a></h1> 
        <nav>
            <a href="index.html" title="Inicio">Inicio</a>
            <a href="piloto.html" title="Información del piloto">Piloto</a>
            <a href="circuito.html" title="Información de circuitos">Circuito</a>
            <a href="meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="clasificaciones.php" title="Clasificaciones" class="active">Clasificaciones</a>
            <a href="juegos.html" title="Juegos">Juegos</a>
            <a href="ayuda.html" title="Ayuda del proyecto">Ayuda</a>
        </nav>
    </header>


    <p>Estás en: <a href="index.html">Inicio</a> >> <strong>Clasificaciones</strong></p>

    <main>
        <section>
            <h2>Ganador de la carrera</h2>
            <?php if ($ganador): ?>
                <p>Ganador: <?= htmlspecialchars($ganador['nombre']) ?></p>
                <p>Tiempo: <?= htmlspecialchars($ganador['tiempo']) ?> s</p>
            <?php else: ?>
                <p>No disponible.</p>
            <?php endif; ?>
        </section>

        <section>
            <h2>Clasificación del mundial tras la carrera</h2>
            <?php if (!empty($puestos)): ?>
            <ol>
                <?php foreach ($puestos as $p): ?>
                    <li><?= htmlspecialchars($p['piloto']) ?>: <?= htmlspecialchars($p['puntos']) ?> puntos</li>
                <?php endforeach; ?>
            </ol>
            <?php else: ?>
                <p>No disponible.</p>
            <?php endif; ?>
        </section>
    </main>

    <footer>
        <p>&copy; David Muñoz Río - 2025</p>
    </footer>
    
</body>
</html>
