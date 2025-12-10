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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Configuración Test - MotoGP</title>
    <link rel="stylesheet" href="../estilo/estilo.css">

  </head>
  <body>
    <main>
      <h1>Configuración - Test de Usabilidad</h1>
      <p>Operaciones disponibles sobre la base de datos de pruebas.</p>

      <?php if($msg): ?>
        <p class="msg-ok"><?= htmlspecialchars($msg) ?></p>
      <?php endif; ?>

      <?php if($error): ?>
        <p class="msg-error"><?= htmlspecialchars($error) ?></p>
      <?php endif; ?>

      <form method="post">
        <button class="btn" type="submit" name="accion" value="reiniciar">
          Reiniciar datos (vaciar tablas)
        </button>

        <button class="btn danger" type="submit" name="accion" value="eliminar">
          Eliminar base de datos
        </button>

        <button class="btn info" type="submit" name="accion" value="exportar">
          Exportar resultados (.csv)
        </button>
      </form>
    </main>
  </body>
</html>
