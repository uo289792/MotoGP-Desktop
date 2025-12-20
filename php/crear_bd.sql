CREATE DATABASE IF NOT EXISTS UO289792_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE UO289792_DB;

-- Tabla de profesiones
CREATE TABLE profesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de dispositivos
CREATE TABLE dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    codigo_usuario VARCHAR(20) PRIMARY KEY,
    profesion_id INT,
    edad INT,
    genero ENUM('M','F','O') NOT NULL,
    pericia_informatica ENUM('baja','media','alta') NOT NULL,
    FOREIGN KEY (profesion_id) REFERENCES profesiones(id)
);

-- Tabla de resultados de prueba
CREATE TABLE resultados_prueba (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_usuario VARCHAR(20) NOT NULL,
    dispositivo_id INT NOT NULL,
    tiempo_segundos DECIMAL(10,3) NOT NULL,
    completada BOOLEAN NOT NULL,
    respuestas JSON NOT NULL, -- aquí van las 10 respuestas
    comentarios_usuario TEXT, -- observaciones del usuario
    propuestas_mejora TEXT,   -- propuestas de mejora
    valoracion TINYINT UNSIGNED CHECK (valoracion BETWEEN 0 AND 10),
    FOREIGN KEY (codigo_usuario) REFERENCES usuarios(codigo_usuario),
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id)
);


-- Tabla de observaciones del facilitador
CREATE TABLE observaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_usuario VARCHAR(20) NOT NULL,
    comentarios TEXT,
    FOREIGN KEY (codigo_usuario) REFERENCES usuarios(codigo_usuario)
);

INSERT INTO dispositivos (nombre) VALUES ('ordenador'), ('tableta'), ('teléfono');
