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
$datos = json_decode($json);

// Si hay datos, los insertamos en la tabla
if ($datos) {
    $id = $datos->id;
    $desc = $datos->descripcion;
    $imp  = $datos->importe;
    $fech = $datos->fecha;
    $cat  = $datos->categoria_id;
    

    // El orden debe coincidir con los campos de tu tabla
    $stmt = $conexion->prepare("UPDATE transacciones SET categoria_id = ?, importe = ?, fecha = ?, descripcion = ? WHERE id = ? AND usuario_id = ?");
    
    // "idssii" significa: entero, decimal(double), string, string, entero, entero
    $stmt->bind_param("idssii", $cat, $imp, $fech, $desc, $id, $user);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["resultado" => "OK"]);
        } else {
            echo json_encode(["resultado" => "ERROR", "error" => "No se pudo actualizar, no existe o no te pertenece"]);
        }
    } else {
        echo json_encode(["resultado" => "ERROR", "error" => $stmt->error]);
    }
    $stmt->close();
}
$conexion->close();
?>