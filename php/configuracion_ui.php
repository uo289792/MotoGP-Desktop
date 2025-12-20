<?php
// php/configuracion_ui.php
require_once __DIR__.'/Configuracion.php';
$cfg = new Configuracion();
$msg = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (isset($_POST['accion'])) {
            $accion = $_POST['accion'];
            if ($accion === 'reiniciar') {
                $cfg->reiniciarDatos();
                $msg = 'Datos reiniciados correctamente.';
            } elseif ($accion === 'eliminar') {
                $cfg->eliminarBaseDatos();
                $msg = 'Base de datos eliminada correctamente.';
            } elseif ($accion === 'exportar') {
                // exporta y termina la ejecución (envía CSV)
                $cfg->exportarCSV('resultados_prueba.csv');
            } else {
                $error = 'Acción desconocida.';
            }
        }
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Configuración de la base de datos del proyecto MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, configuracion, base de datos" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MotoGP-Configuración</title>

    <link rel="stylesheet" href="../estilo/estilo.css" />
    <link rel="stylesheet" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/favicon.ico" type="image/x-icon">

  </head>
  <body>

    <header>
        <h1>MotoGP Desktop</h1> 
        <nav aria-label="Menú principal">
            <a href="../index.html" title="Inicio">Inicio</a>
            <a href="../piloto.html" title="Información del piloto">Piloto</a>
            <a href="../circuito.html" title="Información de circuitos">Circuito</a>
            <a href="../meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="../clasificaciones.php" title="Clasificaciones">Clasificaciones</a>
            <a href="../juegos.html" title="Juegos" class="active">Juegos</a>
            <a href="../ayuda.html" title="Ayuda del proyecto">Ayuda</a>
        </nav>
      </header>

    <p>Estás en: <a href="../index.html">Inicio</a> >> <a href="../juegos.html">Juegos</a> >> Configuración de la base de datos</p>

    <main>

      <h1>Configuración - Test de Usabilidad</h1>
      <p>Operaciones disponibles sobre la base de datos de pruebas.</p>

      <?php if($msg): ?>
        <p><?= htmlspecialchars($msg) ?></p>
      <?php endif; ?>

      <?php if($error): ?>
        <p><?= htmlspecialchars($error) ?></p>
      <?php endif; ?>

      <form method="post">
        <button type="submit" name="accion" value="reiniciar">
          Reiniciar datos (vaciar tablas)
        </button>

        <button type="submit" name="accion" value="eliminar">
          Eliminar base de datos
        </button>

        <button type="submit" name="accion" value="exportar">
          Exportar resultados (.csv)
        </button>
      </form>
    </main>

    <footer>
        <p>&copy; David Muñoz Río - 2025</p>
    </footer>
    
  </body>
</html>
