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
$data = json_decode($json);

if ($data && isset($data->id)) {
    $id = $data->id;

    // 1. Preparamos la sentencia con el marcador '?'
    $stmt = $conexion->prepare("DELETE FROM transacciones WHERE id = ?");
    
    // 2. Vinculamos el ID como un entero ('i')
    $stmt->bind_param("i", $id);

    // 3. Ejecutamos y respondemos
    if ($stmt->execute()) {
        echo json_encode(["resultado" => "OK"]);
    } else {
        echo json_encode(["resultado" => "ERROR", "error" => $stmt->error]);
    }

    // 4. Limpieza de recursos
    $stmt->close();
} else {
    echo json_encode(["resultado" => "ERROR", "mensaje" => "ID no recibido"]);
}
$conexion->close();
?>