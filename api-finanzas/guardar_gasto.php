<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php'; // Incluye la conexión

// Capturamos el JSON que envía Angular
$json = file_get_contents('php://input');
$datos = json_decode($json);

// Si hay datos, los insertamos en la tabla
if ($datos) {
    $desc = $datos->descripcion;
    $imp  = $datos->importe;
    $fech = $datos->fecha;
    $cat  = $datos->categoria_id;
    $user = $datos->usuario_id;

    // El orden debe coincidir con los campos de tu tabla
    $stmt = $conexion->prepare("INSERT INTO transacciones (usuario_id, categoria_id, importe, fecha, descripcion) VALUES (?, ?, ?, ?, ?)");
    
    // "iids s" significa: entero, entero, decimal(double), string, string
    $stmt->bind_param("iidss", $user, $cat, $imp, $fech, $desc);

    if ($stmt->execute()) {
        echo json_encode(["resultado" => "OK"]);
    } else {
        echo json_encode(["resultado" => "ERROR", "error" => $stmt->error]);
    }
    $stmt->close();
}
$conexion->close();
?>