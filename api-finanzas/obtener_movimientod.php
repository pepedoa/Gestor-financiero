<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Token, Authorization, X-Requested-With, Cache-Control, Accept, Origin");

// El bloque OPTIONS que ya tenías es fundamental, déjalo así:
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
include 'conexion.php'; // Incluye la conexión 
include 'jwt.php';


$paseVIP = verificarJWT();

if (!$paseVIP) {
     echo json_encode(["resultado" => "ERROR", "error" => "Acceso Denegado"]);
     exit;
}else{
    $userId = intval($paseVIP->usuario_id);
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
        INNER JOIN categorias ON transacciones.categoria_id = categorias.id WHERE transacciones.usuario_id = $userId ORDER BY id ASC ";

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
}




?>