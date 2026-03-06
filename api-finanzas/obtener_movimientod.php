<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
include 'conexion.php'; // Incluye la conexión 

// Realizamos la consulta
$sql="SELECT 
        transacciones.id,
        transacciones.descripcion,
        transacciones.fecha,
        transacciones.importe,
        transacciones.categoria_id, 
        transacciones.usuario_id,
        categorias.tipo_de_movimiento
      FROM transacciones 
      INNER JOIN categorias ON transacciones.categoria_id = categorias.id ORDER BY id ASC";

// Ejecutamos la consulta
$resultado = $conexion->query($sql);
$datos = [];



if ($resultado) {
    // Recorremos los resultados y los almacenamos en un array
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }
    // Liberamos la memoria del resultado 
    $resultado->free();
}

// Cerramos la conexión 
$conexion->close();


echo json_encode($datos);

?>