<?php
// jwt.php - Módulo de seguridad

require_once 'config.php';

function generarJWT($usuario_id, $nombre) {
    // 1. Cabecera (dice qué algoritmo usamos)
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // 2. Payload (Los datos públicos: el id del usuario y una fecha de expiración si queremos)
    $payload = json_encode([
        'usuario_id' => $usuario_id,
        'nombre' => $nombre,
        'exp' => time() + (60 * 60) // Expira en 1 hora
    ]);
    
    // Codificamos los dos primeros trozos para que sean texto seguro para la web
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // 3. FIRMA (Aquí mezclamos la cabecera, el payload y nuestro SECRETO)
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Juntamos todo con puntitos y ¡un Token!
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verificarJWT() {
$authHeader = null;
    
    // 1. Obtener todas las cabeceras del servidor
    $requestHeaders = [];
    if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
    }

    // 2. Buscamos el token en 'X-Token' (nuestro plan B para Laragon)
    // También miramos en Authorization por si en el futuro cambias de servidor
    if (isset($requestHeaders['X-Token'])) {
        $authHeader = $requestHeaders['X-Token'];
    } elseif (isset($requestHeaders['x-token'])) {
        $authHeader = $requestHeaders['x-token'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($requestHeaders['Authorization'])) {
        $authHeader = $requestHeaders['Authorization'];
    }
    // Si no hay cabecera en absoluto, denegamos el acceso directamente
    if (!$authHeader) return false;
    
    // 3. Extraer solo el texto mágico (quitar la palabra "Bearer ")
    $token = str_replace('Bearer ', '', $authHeader);
    $token = trim($token);
    
    // 4. Partir el token en sus 3 piezas (Separadas por puntitos: Header.Payload.Firma)
    $partes = explode('.', $token);
    if (count($partes) !== 3) return false; // Si no tiene 3 partes, es invalido
    
    $base64UrlHeader = $partes[0];
    $base64UrlPayload = $partes[1];
    $firmaOriginal = $partes[2];
    
    // 5. Calcular NOSOTROS la firma con nuestra llave SECRETA para ver si coincide con la recibida
    $firmaCalculada = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlFirmaCalculada = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($firmaCalculada));
    
    // 6. ¿Es un billete falso o es auténtico?
    if ($base64UrlFirmaCalculada !== $firmaOriginal) return false;
    
    // 7. Si es original, decodificamos el Payload para leer los datos (el ID y el nombre)
    $payloadTexto = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload));
    $payloadObj = json_decode($payloadTexto);
    
    // 8. Comprobar que no haya caducado (1 hora definimos antes)
    if (time() > $payloadObj->exp) return false;
    
    return $payloadObj; // Devolvemos el objeto (así podrás sacar ->usuario_id)
}

?>
