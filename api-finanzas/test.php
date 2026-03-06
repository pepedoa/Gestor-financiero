<?php
include 'conexion.php'; // Incluye la conexión silenciosa anterior

// Creamos un mensaje para probar
$respuesta = array("mensaje" => "¡Hola desde PHP!", "estado" => "funciona");

// Lo enviamos como JSON
echo json_encode($respuesta);
?>