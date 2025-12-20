<?php
session_start();
require_once __DIR__ . '/cronometro.php';

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

    public function insertarResultados($codigo, $dispositivo, $tiempo, $valoracion, $respuestas, $comentarios_usuario, $propuestas_mejora) {
        $json_respuestas = json_encode($respuestas);
        $completada = 1;

        $stmt = $this->conn->prepare(
            "INSERT INTO resultados_prueba
             (codigo_usuario, dispositivo_id, tiempo_segundos, completada,
              respuestas, comentarios_usuario, propuestas_mejora, valoracion)
             VALUES (?,?,?,?,?,?,?,?)"
        );

        $stmt->bind_param(
            "siidsssi",
            $codigo,
            $dispositivo,
            $tiempo,
            $completada,
            $json_respuestas,
            $comentarios_usuario,
            $propuestas_mejora,
            $valoracion
        );
        $stmt->execute();
        $stmt->close();
    }

    public function insertarObservacionesFacilitador($codigo, $observaciones) {
        if (empty($observaciones)) return;
        $stmt = $this->conn->prepare(
            "INSERT INTO observaciones (codigo_usuario, comentarios) VALUES (?, ?)"
        );
        $stmt->bind_param("ss", $codigo, $observaciones);
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
        $_SESSION['respuestas'] = [];

        for ($i = 1; $i <= 10; $i++) {
            if (empty($_POST['pregunta' . $i])) {
                $error = "Debe responder todas las preguntas.";
                break;
            }
            $_SESSION['respuestas']['pregunta' . $i] = $_POST['pregunta' . $i];
        }

        if ($error === '') {
            $cronometro->parar(); // Detenemos el cronómetro tras las 10 preguntas
            $_SESSION['estado'] = 'datos';
            $estado = 'datos';
        }

    } elseif ($estado === 'datos') {

        $cfg->insertarProfesion($_POST['profesion']);
        $profId = $cfg->getIdProfesion($_POST['profesion']);

        $cfg->insertarUsuario(
            $_POST['codigo_usuario'],
            $profId,
            (int)$_POST['edad'],
            $_POST['genero'],
            $_POST['pericia']
        );

        // Guardar resultados de la prueba
        $cfg->insertarResultados(
            $_POST['codigo_usuario'],
            (int)$_POST['dispositivo_id'],
            $cronometro->getTiempo(),
            (int)$_POST['valoracion'],
            $_SESSION['respuestas'],
            $_POST['comentarios_usuario'] ?? '',
            $_POST['propuestas_mejora'] ?? ''
        );

        // Guardar observaciones del facilitador
        $cfg->insertarObservacionesFacilitador(
            $_POST['codigo_usuario'],
            $_POST['observaciones_facilitador'] ?? ''
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
    <h1>Test de Usabilidad - MotoGP</h1>
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
        $id_input = 'pregunta' . ($i + 1);
        echo '<label for="' . $id_input . '">' . ($i + 1) . '. ' . htmlspecialchars($pregunta) . '</label>';
        echo '<input type="text" id="' . $id_input . '" name="' . $id_input . '" required>';
    }
    ?>

        <p>
            <button type="submit">Finalizar</button>
        </p>
    </section>

<?php elseif ($estado === 'datos'): ?>

    <section>
        <h2>Datos del usuario y observaciones</h2>

        <label for="codigo_usuario:">Código de usuario</label>
            <input type="text" id="codigo_usuario" name="codigo_usuario" required>

        <label for="profesion">Profesión:</label>
            <input type="text" id="profesion" name="profesion" required>

        <label for="edad">Edad:</label>
            <input type="number" id="edad" name="edad" min="0" max="120" required>

        <label for="genero">Género:</label>
            <select id="genero" name="genero" required>
                <option value="">Seleccione</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
            </select>
    
        <label for="pericia">Pericia informática:</label>
            <select id="pericia" name="pericia" required>
                <option value="">Seleccione</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
            </select>

        <label for="dispositivo_id">Dispositivo:</label>
            <select id="dispositivo_id" name="dispositivo_id" required>
                <option value="1">Ordenador</option>
                <option value="2">Tableta</option>
                <option value="3">Teléfono</option>
            </select>

        <label for="valoracion">Valoración general (0-10):</label>
            <input type="number" id="valoracion" name="valoracion" min="0" max="10" required>

        <label for="comentarios_usuario">Observaciones del usuario:</label>
            <textarea id="comentarios_usuario" name="comentarios_usuario" rows="5" cols="50"></textarea>

        <label for="propuestas_mejora">Propuestas de mejora:</label>
            <textarea id="propuestas_mejora" name="propuestas_mejora" rows="5" cols="50"></textarea>

        <label for="observaciones_facilitador">Observaciones del facilitador:</label>
            <textarea id="observaciones_facilitador" name="observaciones_facilitador" rows="5" cols="50"></textarea>
        
        <p>
            <button type="submit">Finalizar</button>
        </p>
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
