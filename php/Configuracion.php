<?php

class Configuracion {
    private $host = 'localhost';
    private $user = 'DBUSER2025';
    private $pass = 'DBPSWD2025';        
    private $db   = 'UO289792_DB';
    private $conn;

    public function __construct() {
        // Conexión sin seleccionar BD
        $this->conn = new mysqli($this->host, $this->user, $this->pass);
        
        if ($this->conn->connect_errno) {
            $this->conn = null; // No hay conexión posible
            return;
        }

        // Verificar si la BD existe
        $res = $this->conn->query("SHOW DATABASES LIKE '{$this->db}'");
        if ($res && $res->num_rows > 0) {
            // Seleccionamos la BD
            $this->conn->select_db($this->db);
            $this->conn->set_charset('utf8mb4');
        } else {
            $this->conn = null; // La BD no existe
        }
    }


    // Reinicia los datos de las tablas, si existen
    public function reiniciarDatos() {
    if (!$this->conn) return "La base de datos '{$this->db}' no existe.";

    // Orden correcto: primero las tablas hijas, luego las tablas padres
    $tables = ['resultados_prueba','observaciones','usuarios'];

    $this->conn->query("SET FOREIGN_KEY_CHECKS=0");

    foreach ($tables as $t) {
        $res = $this->conn->query("SHOW TABLES LIKE '$t'");
        if ($res && $res->num_rows > 0) {
            $sql = "TRUNCATE TABLE `$t`";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error truncando $t: " . $this->conn->error);
            }
        }
    }

    $this->conn->query("SET FOREIGN_KEY_CHECKS=1");
    return "Datos reiniciados correctamente.";
}


    // Elimina la base de datos si existe
    public function eliminarBaseDatos() {
        $link = new mysqli($this->host, $this->user, $this->pass);
        if ($link->connect_errno) throw new Exception("No se pudo conectar: $link->connect_error");

        // Verificar si existe la BD
        $res = $link->query("SHOW DATABASES LIKE '{$this->db}'");
        if ($res && $res->num_rows === 0) {
            $link->close();
            return "La base de datos '{$this->db}' no existe.";
        }

        // Ejecutar DROP
        if (!$link->query("DROP DATABASE `{$this->db}`")) {
            $link->close();
            throw new Exception("Error eliminando BD: " . $link->error);
        }
        $link->close();
        return "Base de datos eliminada correctamente.";
    }

    // Exporta CSV si la BD y tabla existen
    // Exporta CSV si la BD y tabla existen
    public function exportarCSV($outFilename = 'resultados_prueba.csv') {

        if (!$this->conn) {
            throw new Exception("La base de datos '{$this->db}' no existe.");
        }

        // Comprobar si existe la tabla
        $res = $this->conn->query("SHOW TABLES LIKE 'resultados_prueba'");
        if (!$res || $res->num_rows === 0) {
            throw new Exception("No existe la tabla 'resultados_prueba'.");
        }

        // Consulta completa con todos los datos relevantes
        $sql = "
            SELECT 
                r.id,
                r.codigo_usuario,
                u.profesion_id,
                p.nombre AS profesion,
                u.edad,
                u.genero,
                u.pericia_informatica,
                r.dispositivo_id,
                d.nombre AS dispositivo,
                r.tiempo_segundos,
                r.completada,
                r.respuestas,
                r.comentarios_usuario,
                r.propuestas_mejora,
                r.valoracion,
                o.comentarios AS observaciones_facilitador
            FROM resultados_prueba r
            LEFT JOIN usuarios u ON r.codigo_usuario = u.codigo_usuario
            LEFT JOIN profesiones p ON u.profesion_id = p.id
            LEFT JOIN dispositivos d ON r.dispositivo_id = d.id
            LEFT JOIN observaciones o ON r.codigo_usuario = o.codigo_usuario
            ORDER BY r.id ASC
        ";

        $res = $this->conn->query($sql);
        if (!$res) {
            throw new Exception("Error consultando resultados: " . $this->conn->error);
        }

        // Cabeceras para descarga
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="'.$outFilename.'"');

        // Abrir salida CSV
        $out = fopen('php://output', 'w');

        // Cabecera del CSV
        fputcsv($out, [
            'id',
            'codigo_usuario',
            'profesion_id',
            'profesion',
            'edad',
            'genero',
            'pericia_informatica',
            'dispositivo_id',
            'dispositivo',
            'tiempo_segundos',
            'completada',
            'respuestas',
            'comentarios_usuario',
            'propuestas_mejora',
            'valoracion',
            'observaciones_facilitador'
        ]);

        // Filas de datos
        while ($row = $res->fetch_assoc()) {
            fputcsv($out, [
                $row['id'],
                $row['codigo_usuario'],
                $row['profesion_id'],
                $row['profesion'],
                $row['edad'],
                $row['genero'],
                $row['pericia_informatica'],
                $row['dispositivo_id'],
                $row['dispositivo'],
                $row['tiempo_segundos'],
                $row['completada'] ? '1' : '0',
                $row['respuestas'],
                $row['comentarios_usuario'],
                $row['propuestas_mejora'],
                $row['valoracion'],
                $row['observaciones_facilitador']
            ]);
        }

        fclose($out);
        exit;
    }

    public function __destruct() {
        if ($this->conn && $this->conn->ping()) $this->conn->close();
    }
}
?>