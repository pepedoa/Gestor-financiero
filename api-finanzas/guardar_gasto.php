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

// Esto limpia cualquier error de texto previo que pueda ensuciar el JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_clean();

$infoToken = verificarJWT();

if($infoToken){
    $user = $infoToken->usuario_id;
}else{
    ob_end_clean();
    http_response_code(401);
    echo json_encode(["resultado" => "ERROR", "error" => "No tienes permisos o el token es falso"]);
    exit;
}


// Capturamos el JSON que envía Angular
$json = file_get_contents('php://input');
$datos = json_decode($json);

// Si hay datos, los insertamos en la tabla
if ($datos) {
    $desc = $datos->descripcion;
    $imp  = $datos->importe;
    $fech = $datos->fecha;
    $cat  = $datos->categoria_id;

    // --- COMPROBACIÓN : CAMPOS VACÍOS ---
    // Aquí es donde validamos ANTES de intentar el INSERT
    if (empty($desc) || empty($imp) || empty($fech) || empty($cat)) {
        ob_end_clean();
        http_response_code(400); // Bad Request
        echo json_encode(["resultado" => "ERROR", "error" => "Campos vacíos, por favor rellene todo"]);
        exit;
    }
    

    // El orden debe coincidir con los campos de tu tabla
    $stmt = $conexion->prepare("INSERT INTO transacciones (usuario_id, categoria_id, importe, fecha, descripcion) VALUES (?, ?, ?, ?, ?)");
    
    // "iids s" significa: entero, entero, decimal(double), string, string
    $stmt->bind_param("iidss", $user, $cat, $imp, $fech, $desc);

    if ($stmt->execute()) {
        echo json_encode(["resultado" => "OK"]);
    } else {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(["resultado" => "ERROR", "error" => "No se han recibido datos"]);
    }
    $stmt->close();
}
$conexion->close();
?>