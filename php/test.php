<?php
// php/prueba_usabilidad_completa.php
session_start();

// --- Importar la clase Cronometro desde la raíz ---
require_once __DIR__.'/Cronometro.php'; // Ajusta la ruta si tu cronómetro está en la raíz

// --- Clase para operaciones en BD ---
class Configuracion {
    private $host = 'localhost';
    private $user = 'DBUSER2025';
    private $pass = 'DBPSWD2025';
    private $db = 'UO289792_DB';
    private $conn;

    public function __construct() {
        $this->conn = new mysqli($this->host,$this->user,$this->pass,$this->db);
        if ($this->conn->connect_errno) die("Error conexión BD: " . $this->conn->connect_error);
        $this->conn->set_charset('utf8mb4');
    }

    public function insertarProfesion($nombre){
        $stmt = $this->conn->prepare("SELECT id FROM profesiones WHERE nombre=?");
        $stmt->bind_param("s",$nombre);
        $stmt->execute();
        $stmt->bind_result($id);
        if($stmt->fetch()){ $stmt->close(); return; }
        $stmt->close();
        $stmt = $this->conn->prepare("INSERT INTO profesiones (nombre) VALUES (?)");
        $stmt->bind_param("s",$nombre);
        $stmt->execute();
        $stmt->close();
    }

    public function getIdProfesion($nombre){
        $stmt = $this->conn->prepare("SELECT id FROM profesiones WHERE nombre=?");
        $stmt->bind_param("s",$nombre);
        $stmt->execute();
        $stmt->bind_result($id);
        $stmt->fetch();
        $stmt->close();
        return $id;
    }

    public function insertarUsuario($codigo,$profId,$edad,$genero,$pericia){
        $stmt = $this->conn->prepare("SELECT codigo_usuario FROM usuarios WHERE codigo_usuario=?");
        $stmt->bind_param("s",$codigo);
        $stmt->execute();
        if(!$stmt->fetch()){
            $stmt->close();
            $stmt = $this->conn->prepare("INSERT INTO usuarios (codigo_usuario,profesion_id,edad,genero,pericia_informatica) VALUES (?,?,?,?,?)");
            $stmt->bind_param("siiss",$codigo,$profId,$edad,$genero,$pericia);
            $stmt->execute();
            $stmt->close();
        } else {
            $stmt->close();
        }
    }

    public function insertarResultados($codigo,$dispositivo_id,$tiempo,$valoracion,$respuestas){
        $comentarios_usuario = null;
        $propuestas_mejora = json_encode($respuestas); // guardamos las respuestas como JSON
        $completada = 1;
        $stmt = $this->conn->prepare("INSERT INTO resultados_prueba (codigo_usuario, dispositivo_id, tiempo_segundos, completada, comentarios_usuario, propuestas_mejora, valoracion) VALUES (?,?,?,?,?,?,?)");
        $stmt->bind_param("siidssi",$codigo,$dispositivo_id,$tiempo,$completada,$comentarios_usuario,$propuestas_mejora,$valoracion);
        $stmt->execute();
        $stmt->close();
    }

    public function insertarObservaciones($codigo,$comentarios){
        $stmt = $this->conn->prepare("INSERT INTO observaciones (codigo_usuario, comentarios) VALUES (?,?)");
        $stmt->bind_param("ss",$codigo,$comentarios);
        $stmt->execute();
        $stmt->close();
    }
}

// --- Inicializar ---
$cronometro = new Cronometro();
$cfg = new Configuracion();
$msg = '';
$error = '';

// --- Manejo de acciones ---
if ($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['accion'])){
    if($_POST['accion']==='arrancar'){
        $cronometro->arrancar();
        $msg = "Prueba iniciada.";
    } elseif($_POST['accion']==='terminar'){
        $cronometro->parar();
        try{
            // Recoger respuestas
            $respuestas = [];
            for($i=1;$i<=10;$i++){
                if(!isset($_POST['pregunta'.$i]) || $_POST['pregunta'.$i]==='') throw new Exception("Debe responder todas las preguntas.");
                $respuestas['pregunta'.$i] = $_POST['pregunta'.$i];
            }

            // Datos de usuario tomados del formulario
            $codigo_usuario = $_POST['codigo_usuario'];
            $profesion = $_POST['profesion'];
            $edad = (int)$_POST['edad'];
            $genero = $_POST['genero'];
            $pericia = $_POST['pericia'];
            $dispositivo_id = (int)$_POST['dispositivo_id'];
            $valoracion = (int)$_POST['valoracion'];
            $tiempo_segundos = $cronometro->getTiempo();
            $comentarios_observador = $_POST['comentarios_observador'] ?? null;

            // Guardar en BD
            $cfg->insertarProfesion($profesion);
            $profId = $cfg->getIdProfesion($profesion);
            $cfg->insertarUsuario($codigo_usuario,$profId,$edad,$genero,$pericia);
            $cfg->insertarResultados($codigo_usuario,$dispositivo_id,$tiempo_segundos,$valoracion,$respuestas);

            if($comentarios_observador){
                $cfg->insertarObservaciones($codigo_usuario,$comentarios_observador);
            }

            $msg = "Prueba finalizada correctamente.";
            $cronometro->reiniciar();
        } catch(Exception $e){
            $error = $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Prueba de Usabilidad - MotoGP</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
</head>
<body>
    <main>       
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

    <p class="migas">Estás en: <a href="index.html">Inicio</a> >> <a href="juegos.html">Juegos</a> >> Test de Usabilidad</p>


    <h2>Prueba de Usabilidad - MotoGP</h2>

    <?php if($msg): ?><p class="msg-ok"><?= htmlspecialchars($msg) ?></p><?php endif; ?>
    <?php if($error): ?><p class="msg-error"><?= htmlspecialchars($error) ?></p><?php endif; ?>

    <form method="post">
    <?php if(!isset($_POST['accion']) || $_POST['accion']!=='arrancar'): ?>
        <label for="codigo_usuario">Código de usuario:</label>
        <input type="text" name="codigo_usuario" id="codigo_usuario" required><br><br>

        <label for="profesion">Profesión:</label>
        <input type="text" name="profesion" id="profesion" required><br><br>

        <label for="edad">Edad:</label>
        <input type="number" name="edad" id="edad" required><br><br>

        <label for="genero">Género:</label>
        <select name="genero" id="genero" required>
            <option value="">--Selecciona--</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
        </select><br><br>

        <label for="pericia">Pericia informática:</label>
        <select name="pericia" id="pericia" required>
            <option value="">--Selecciona--</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
        </select><br><br>

        <label for="dispositivo_id">Dispositivo:</label>
        <select name="dispositivo_id" id="dispositivo_id" required>
            <option value="1">Ordenador</option>
            <option value="2">Tableta</option>
            <option value="3">Teléfono</option>
        </select><br><br>

        <label for="valoracion">Valoración general (0-10):</label>
        <input type="number" name="valoracion" id="valoracion" min="0" max="10" required><br><br>

        <button type="submit" name="accion" value="arrancar">Iniciar prueba</button>

    <?php else: ?>
        <?php
        // Preguntas relacionadas con la base de datos y estructura del proyecto
        $preguntas = [
            "¿Cuál es la profesión asociada al usuario?",
            "¿Qué dispositivos se han registrado en la base de datos?",
            "¿Qué campo identifica de forma única a cada usuario?",
            "¿Qué tipo de dato almacena la pericia informática?",
            "¿Qué tabla contiene los comentarios del facilitador?",
            "¿Qué tabla almacena los resultados de la prueba?",
            "¿Qué campo indica si la prueba se completó?",
            "¿Cómo se guarda el tiempo empleado en la prueba?",
            "¿Qué tipo de datos se guarda en la columna propuestas_mejora?",
            "¿Qué relación existe entre usuarios y resultados_prueba?"
        ];
        ?>

        <?php foreach($preguntas as $i => $q): ?>
            <label for="pregunta<?=($i+1)?>"><?=($i+1)?>. <?=htmlspecialchars($q)?></label>
            <input type="text" name="pregunta<?=($i+1)?>" id="pregunta<?=($i+1)?>" required><br><br>
        <?php endforeach; ?>

        <label for="comentarios_observador">Comentarios del observador:</label>
        <textarea name="comentarios_observador" id="comentarios_observador"></textarea><br><br>

        <button type="submit" name="accion" value="terminar">Terminar prueba</button>
    <?php endif; ?>
    </form>
    </main>
</body>
</html>
