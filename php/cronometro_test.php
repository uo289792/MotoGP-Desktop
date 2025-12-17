<?php
class Cronometro {
    private $inicio;
    private $tiempo;

    public function __construct() {
        $this->tiempo = 0;
    }

    public function arrancar() {
        $this->inicio = microtime(true);
    }

    public function parar() {
        if (isset($this->inicio)) {
            $this->tiempo = microtime(true) - $this->inicio;
        }
    }

    public function mostrar() {
        $total = $this->tiempo;
        $minutos = floor($total / 60);
        $segundos = floor($total % 60);
        $decimas = floor(($total - floor($total)) * 10);
        return sprintf("%02d:%02d.%d", $minutos, $segundos, $decimas);
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Cronometro con php del proyecto MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, cronometro, tiempo" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MotoGP-Cronometro</title>

    <link rel="stylesheet" href="../estilo/estilo.css" />
    <link rel="stylesheet" href="../estilo/layout.css" />

</head>
<body>
     <header>
        <h1>MotoGP Desktop</h1> 
        <nav>
            <a href="index.html" title="Inicio">Inicio</a>
            <a href="piloto.html" title="Información del piloto">Piloto</a>
            <a href="circuito.html" title="Información de circuitos">Circuito</a>
            <a href="meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="clasificaciones.php" title="Clasificaciones">Clasificaciones</a>
            <a href="juegos.html" title="Juegos" class="active">Juegos</a>
            <a href="ayuda.html" title="Ayuda del proyecto">Ayuda</a>
        </nav>
    </header>


    <main>
        <section>
            <h2>Prueba del cronómetro</h2>
            <form method="post">
                <button type="submit" name="accion" value="arrancar">Arrancar</button>
                <button type="submit" name="accion" value="parar">Parar</button>
                <button type="submit" name="accion" value="mostrar">Mostrar</button>
            </form>

            <?php
            session_start();
            if (!isset($_SESSION['cronometro'])) {
                $_SESSION['cronometro'] = new Cronometro();
            }

            $cronometro = $_SESSION['cronometro'];

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $accion = $_POST['accion'] ?? '';
                if ($accion === 'arrancar') {
                    $cronometro->arrancar();
                    echo "<p>Cronómetro arrancado.</p>";
                } elseif ($accion === 'parar') {
                    $cronometro->parar();
                    echo "<p>Cronómetro detenido.</p>";
                } elseif ($accion === 'mostrar') {
                    echo "<p>Tiempo transcurrido: " . $cronometro->mostrar() . "</p>";
                }
            }
            ?>
        </section>
    </main>

</body>
</html>

