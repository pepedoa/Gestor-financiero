<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
include 'conexion.php'; // Incluye la conexión 

$sql="SELECT categorias.id,categorias.tipo_de_movimiento FROM categorias"; 

// Ejecutamos la consulta
$resultado = $conexion->query($sql);
$cat = [];


if ($resultado) {
    // Recorremos los resultados y los almacenamos en un array
    while ($fila = $resultado->fetch_assoc()) {
        $cat[] = $fila;
    }
    // Liberamos la memoria del resultado 
    $resultado->free();
}

// Cerramos la conexión 
$conexion->close();

echo json_encode($cat);

?>