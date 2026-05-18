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
    $pass = $datos->password;

    

    if (empty($nom) || empty($pass)) {
    echo json_encode(["resultado" => "ERROR", "error" => "Faltan datos por rellenar"]);
    exit;
}

    $stmt = $conexion->prepare("SELECT id, nombre, password FROM usuarios WHERE nombre = ?");
    $stmt->bind_param("s", $nom);
    $stmt->execute();
 
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {

        $fila_de_bd = $resultado->fetch_assoc();
        if (password_verify($pass, $fila_de_bd['password'])){
           $nombre_real = $fila_de_bd['nombre'];
           $id_real = $fila_de_bd['id'];
           $mi_super_token = generarJWT($fila_de_bd['id'], $nombre_real);
           echo json_encode([
                "resultado" => "OK",
                "token" => $mi_super_token,
                "nombre" => $nombre_real
            ]);

        }else{
            echo json_encode(["resultado" => "ERROR", "error" => "Usuario o contraseña incorrectos"]);
        }

        // Liberamos la memoria del resultado 
        $resultado->free();
        $stmt->close();
        exit;
        
       
    }else{
        echo json_encode(["resultado" => "ERROR", "error" => "Usuario o contraseña incorrectos"]);
        $stmt->close();
    }
        

   
}
$conexion->close();
?>