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

// Capturamos el JSON que envía Angular
$json = file_get_contents('php://input');
$datos = json_decode($json);

// Si hay datos, los insertamos en la tabla
if ($datos) {
    $nom = $datos->nombre;
    $email  = $datos->email;
    $pass = $datos->password;

    $password_segura = password_hash($pass, PASSWORD_DEFAULT);

    if (empty($nom) || empty($email) || empty($pass)) {
    echo json_encode(["resultado" => "ERROR", "error" => "Faltan datos por rellenar"]);
    exit;
}

    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {
        echo json_encode(["resultado" => "ERROR", "error" => "El usuario ya está registrado"]);
        $resultado->free();
        $stmt->close();
        $conexion->close();
        exit;
    } else {
        // Liberamos la memoria del resultado del SELECT
        $resultado->free();
        $stmt->close();

        // Preparamos y ejecutamos el INSERT
        $stmt = $conexion->prepare("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nom, $email, $password_segura);
        
        if ($stmt->execute()) {
            // Obtenemos el ID que la base de datos acaba de asignar
            $nuevo_id = $conexion->insert_id;
            $token = generarJWT($nuevo_id, $nom);

            echo json_encode([
                "resultado" => "OK",
                "token" => $token,
                "usuario" => [
                    "id" => $conexion->insert_id,
                    "email" => $email,
                    "nombre" => $nom
                ]
            ]);
        } else {
            echo json_encode(["resultado" => "ERROR", "error" => $stmt->error]);
        }
        $stmt->close();
    }
}
$conexion->close();
?>