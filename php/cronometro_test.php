<?php
session_start();
require_once __DIR__ . '/cronometro.php'; 


$tiempo = $_SESSION['cronometro_tiempo'] ?? 0;
$inicio = $_SESSION['cronometro_inicio'] ?? null;
$cronometro = new Cronometro($tiempo, $inicio); 

$mensaje = '';
$tiempoHtml = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $accion = $_POST['accion'] ?? '';

    if ($accion === 'arrancar') {
        $cronometro->reiniciar();  
        $cronometro->arrancar();   
        $mensaje = 'Cronómetro arrancado desde cero.';
    } elseif ($accion === 'parar') {
        $cronometro->parar();
        $mensaje = 'Cronómetro detenido.';
    } elseif ($accion === 'mostrar') {
        $tiempoHtml = '<p>Tiempo transcurrido: ' . $cronometro->mostrar() . '</p>';
    }

    $_SESSION['cronometro_tiempo'] = $cronometro->getTiempo();
    $_SESSION['cronometro_inicio'] = $cronometro->getInicio();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="author" content="David Muñoz Río">
    <meta name="description" content="Prueba del cronómetro del proyecto MotoGP-Desktop">
    <meta name="keywords" content="MotoGP, cronómetro, PHP, pruebas">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MotoGP Cronómetro</title>

    <link rel="stylesheet" href="../estilo/estilo.css" />
    <link rel="stylesheet" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/favicon.ico" type="image/x-icon">
</head>

<body>

    <header>
        <h1><a href="../index.html">MotoGP Desktop</a></h1>         
            <nav>
            <a href="../index.html" title="Inicio">Inicio</a>
            <a href="../piloto.html" title="Información del piloto">Piloto</a>
            <a href="../circuito.html" title="Información de circuitos">Circuito</a>
            <a href="../meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="../clasificaciones.php" title="Clasificaciones">Clasificaciones</a>
            <a href="../juegos.html" title="Juegos" class="active">Juegos</a>
            <a href="../ayuda.html" title="Ayuda del proyecto">Ayuda</a>
        </nav>
    </header>

    <p>Estás en: <a href="../index.html">Inicio</a> >> <a href="../juegos.html">Juegos</a> >> Prueba del cronómetro</p>

    <main>
        <section>
            <h2>Prueba del cronómetro</h2>

            <form method="post">
                <button type="submit" name="accion" value="arrancar">Arrancar</button>
                <button type="submit" name="accion" value="parar">Parar</button>
                <button type="submit" name="accion" value="mostrar">Mostrar</button>
            </form>

            <?php if ($mensaje) echo '<p>' . htmlspecialchars($mensaje) . '</p>'; ?>
            <?= $tiempoHtml ?>
        </section>
    </main>


    <footer>
        <p>&copy; David Muñoz Río - 2025</p>
    </footer>

</body>
</html>
