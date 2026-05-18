<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Token, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php'; // Incluye la conexión
include 'jwt.php';

$infoToken = verificarJWT();

if($infoToken){
    $user = $infoToken->usuario_id;
}else{
    echo json_encode(["resultado" => "ERROR", "error" => "No tienes permisos o el token es falso"]);
    exit;
}

// Capturamos el JSON que envía Angular
$json = file_get_contents('php://input');
$data = json_decode($json);

if ($data && isset($data->ids) && is_array($data->ids)) {
    $listaParaBorrar = $data->ids;

    // 1. Asegúrate de que son números de verdad recorre el array y lo que hay o lo fuerza a convertirse en entero o lo anula con array map
    $listaLimpa = array_map('intval', $listaParaBorrar);
    $idsParaSql = implode(',', $listaLimpa);

    //para poder pasarselo al sql necesito pasar de array a texto y uso el implode

    // 1. Preparamos la sentencia asegurando que coincida id y usuario_id
    $stmt = $conexion->prepare("DELETE FROM transacciones WHERE id  IN ($idsParaSql) AND usuario_id = ?");
    
    // 2. Vinculamos el ID (int) y usuario_id (int) -> 'ii'
    $stmt->bind_param("i", $user);

    // 3. Ejecutamos y respondemos
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["resultado" => "OK"]);
        } else {
            echo json_encode(["resultado" => "ERROR", "error" => "Los IDS no existeN o no tienes permisos para borrarlos"]);
        }
    } else {
        echo json_encode(["resultado" => "ERROR", "error" => $stmt->error]);
    }

    // 4. Limpieza de recursos
    $stmt->close();
} else {
    echo json_encode(["resultado" => "ERROR", "mensaje" => "IDs no recibidos"]);
}
$conexion->close();
?>