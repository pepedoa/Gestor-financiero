<?php
// Ejemplo de configuración (Renombrar a conexion.php y poner datos reales)
$servidor = "localhost";
$usuario  = "tu_usuario";
$password = "tu_password";
$base_datos = "nombre_de_tu_bd";

$conexion = mysqli_connect($servidor, $usuario, $password, $base_datos);
?>