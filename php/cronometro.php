<?php
class Cronometro {
    private $inicio;
    private $tiempo;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->tiempo = $_SESSION['cronometro_tiempo'] ?? 0;
        $this->inicio = $_SESSION['cronometro_inicio'] ?? null;
    }

    public function arrancar() {
        $this->inicio = microtime(true);
        $_SESSION['cronometro_inicio'] = $this->inicio;
    }

    public function parar() {
        if ($this->inicio) {
            $this->tiempo += microtime(true) - $this->inicio;
            $this->inicio = null;
            unset($_SESSION['cronometro_inicio']);
            $_SESSION['cronometro_tiempo'] = $this->tiempo;
        }
    }

    public function getTiempo() {
        if ($this->inicio) return $this->tiempo + (microtime(true) - $this->inicio);
        return $this->tiempo;
    }

    public function reiniciar() {
        $this->inicio = null;
        $this->tiempo = 0;
        unset($_SESSION['cronometro_inicio'], $_SESSION['cronometro_tiempo']);
    }
}
