<?php
session_start();
require_once __DIR__ . '/Cronometro.php';

class Configuracion {

    private $conn;

    public function __construct() {
        $this->conn = new mysqli(
            'localhost',
            'DBUSER2025',
            'DBPSWD2025',
            'UO289792_DB'
        );

        if ($this->conn->connect_errno) {
            die("Error de conexión con la base de datos");
        }

        $this->conn->set_charset('utf8mb4');
    }

    public function insertarProfesion($nombre) {
        $stmt = $this->conn->prepare("SELECT id FROM profesiones WHERE nombre=?");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $stmt->close();
            return;
        }
        $stmt->close();

        $stmt = $this->conn->prepare("INSERT INTO profesiones (nombre) VALUES (?)");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $stmt->close();
    }

    public function getIdProfesion($nombre) {
        $stmt = $this->conn->prepare("SELECT id FROM profesiones WHERE nombre=?");
        $stmt->bind_param("s", $nombre);
        $stmt->execute();
        $stmt->bind_result($id);
        $stmt->fetch();
        $stmt->close();
        return $id;
    }

    public function insertarUsuario($codigo, $profId, $edad, $genero, $pericia) {
        $stmt = $this->conn->prepare(
            "INSERT IGNORE INTO usuarios
             (codigo_usuario, profesion_id, edad, genero, pericia_informatica)
             VALUES (?,?,?,?,?)"
        );
        $stmt->bind_param("siiss", $codigo, $profId, $edad, $genero, $pericia);
        $stmt->execute();
        $stmt->close();
    }

    public function insertarResultados($codigo, $dispositivo, $tiempo, $valoracion, $respuestas, $observaciones) {
        $json = json_encode($respuestas);
        $completada = 1;

        $stmt = $this->conn->prepare(
            "INSERT INTO resultados_prueba
             (codigo_usuario, dispositivo_id, tiempo_segundos, completada,
              comentarios_usuario, propuestas_mejora, valoracion)
             VALUES (?,?,?,?,?,?,?)"
        );
        $stmt->bind_param(
            "siidssi",
            $codigo,
            $dispositivo,
            $tiempo,
            $completada,
            $observaciones,
            $json,
            $valoracion
        );
        $stmt->execute();
        $stmt->close();
    }
}

$cronometro = new Cronometro();
$cfg = new Configuracion();

$estado = $_SESSION['estado'] ?? 'preguntas';
$error  = '';
$msg    = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($estado === 'preguntas') {
        $cronometro->arrancar();
        $_SESSION['respuestas'] = [];

        for ($i = 1; $i <= 10; $i++) {
            if (empty($_POST['pregunta' . $i])) {
                $error = "Debe responder todas las preguntas.";
                break;
            }
            $_SESSION['respuestas']['pregunta' . $i] = $_POST['pregunta' . $i];
        }

        if ($error === '') {
            $_SESSION['estado'] = 'datos';
            $estado = 'datos';
        }
    } elseif ($estado === 'datos') {
        $cronometro->parar();

        $cfg->insertarProfesion($_POST['profesion']);
        $profId = $cfg->getIdProfesion($_POST['profesion']);

        $cfg->insertarUsuario(
            $_POST['codigo_usuario'],
            $profId,
            (int)$_POST['edad'],
            $_POST['genero'],
            $_POST['pericia']
        );

        $cfg->insertarResultados(
            $_POST['codigo_usuario'],
            (int)$_POST['dispositivo_id'],
            $cronometro->getTiempo(),
            (int)$_POST['valoracion'],
            $_SESSION['respuestas'],
            $_POST['observaciones'] ?? null
        );

        $_SESSION['estado'] = 'final';
        $estado = 'final';
        $msg = "Prueba finalizada correctamente.";

        session_destroy();
        header("Refresh:5");
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="author" content="David Muñoz Río">
    <meta name="description" content="Prueba de usabilidad del proyecto MotoGP-Desktop">
    <meta name="keywords" content="MotoGP, usabilidad, test, proyecto académico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MotoGP Test de Usabilidad</title>
    
    <link rel="stylesheet" href="../estilo/estilo.css" />
    <link rel="stylesheet" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/favicon.ico" type="image/x-icon">
</head>
<body>
    <header>
        <h2>Prueba de Usabilidad - MotoGP</h2>
    </header>

    <main>

    <?php if ($error !== '') echo '<p>' . htmlspecialchars($error) . '</p>'; ?>
    <?php if ($msg !== '') echo '<p>' . htmlspecialchars($msg) . '</p>'; ?>

    <form method="post">

    <?php if ($estado === 'preguntas'): ?>

        <section>
        <?php
        $preguntas = [
            "¿Cuál es la temática de las fotos de la página principal?",
            "¿Cuántas noticias aparecen en la página principal?",
            "¿Cuántos enlaces hay en el menú principal?",
            "¿En qué sección se encuentra el mapa?",
            "¿Qué piloto aparece en la sección Piloto?",
            "¿Cuál es su apodo?",
            "¿Qué país está asociado al circuito?",
            "¿Qué temperatura se muestra el día de la carrera?",
            "¿Cuántos botones tiene la sección Juegos?",
            "¿Cuánto tiempo tardas en completar el juego?"
        ];

        foreach ($preguntas as $i => $pregunta) {
            echo '<label>' . ($i + 1) . '. ' . htmlspecialchars($pregunta) . '</label>';
            echo '<input type="text" name="pregunta' . ($i + 1) . '" required>';
            echo '<br>';
        }
        ?>

            <label>Observaciones del usuario:</label>
            <textarea name="observaciones" rows="5" cols="50"></textarea>

            <button type="submit">Continuar</button>
        </section>

    <?php elseif ($estado === 'datos'): ?>

        <section>
            <label>Código de usuario
                <input type="text" name="codigo_usuario" required>
            </label>

            <label>Profesión
                <input type="text" name="profesion" required>
            </label>

            <label>Edad
                <input type="number" name="edad" min="0" max="120" required>
            </label>

            <label>Género
                <select name="genero" required>
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                </select>
            </label>

            <label>Pericia informática
                <select name="pericia" required>
                    <option value="">Seleccione</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </label>

            <label>Dispositivo
                <select name="dispositivo_id" required>
                    <option value="1">Ordenador</option>
                    <option value="2">Tableta</option>
                    <option value="3">Teléfono</option>
                </select>
            </label>

            <label>Valoración general (0-10)
                <input type="number" name="valoracion" min="0" max="10" required>
            </label>

            <button type="submit">Finalizar</button>
        </section>

    <?php else: ?>

        <section>
            <p>La página se cerrará automáticamente en unos segundos.</p>
        </section>

    <?php endif; ?>

    </form>
    </main>

    <footer>
        <p>&copy; David Muñoz Río - 2025</p>
    </footer>
</body>
</html>
