<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
include 'conexion.php'; // Incluye la conexión 

$sql="SELECT usuarios.id,usuarios.nombre FROM usuarios"; 

// Ejecutamos la consulta
$resultado = $conexion->query($sql);
$usu = [];


if ($resultado) {
    // Recorremos los resultados y los almacenamos en un array
    while ($fila = $resultado->fetch_assoc()) {
        $usu[] = $fila;
    }
    // Liberamos la memoria del resultado 
    $resultado->free();
}

// Cerramos la conexión 
$conexion->close();

echo json_encode($usu);

?>