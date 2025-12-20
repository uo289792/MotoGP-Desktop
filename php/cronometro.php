<?php
class Cronometro {
    private $inicio;
    private $tiempo;

    public function __construct($tiempo = 0, $inicio = null) {
        $this->tiempo = $tiempo;
        $this->inicio = $inicio;
    }

    public function arrancar() {
        $this->inicio = microtime(true);
    }

    public function parar() {
        if ($this->inicio !== null) {
            $this->tiempo += microtime(true) - $this->inicio;
            $this->inicio = null;
        }
    }

    public function mostrar() {
        $total = $this->tiempo;
        if ($this->inicio !== null) {
            $total += microtime(true) - $this->inicio;
        }
        $min = floor($total / 60);
        $seg = floor($total % 60);
        $dec = floor(($total - floor($total)) * 10);
        return sprintf("%02d:%02d.%d", $min, $seg, $dec);
    }

    public function reiniciar() {
        $this->tiempo = 0;
        $this->inicio = null;
    }

    // Getters para guardar en sesión
    public function getTiempo() { return $this->tiempo; }
    public function getInicio() { return $this->inicio; }
}
?>