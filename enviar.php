<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Reemplazá esta dirección por tu correo real
    $destino = "info@steffenargentina.com.ar";

    $provincia = htmlspecialchars($_POST["provincia"]);
    $rubro = htmlspecialchars($_POST["rubro"]);
    $localidad = htmlspecialchars($_POST["localidad"]);
    $nombre = htmlspecialchars($_POST["nombre"]);
    $apellido = htmlspecialchars($_POST["apellido"]);
    $telefono = htmlspecialchars($_POST["telefono"]);
    $email = htmlspecialchars($_POST["email"]);
    $mensaje = htmlspecialchars($_POST["mensaje"]);

    $asunto = "Nuevo mensaje desde el formulario web";
    $contenido = "
    Nombre: $nombre\n
    Teléfono: $telefono\n
    Email: $email\n
    Provincia: $provincia\n
    Rubro: $rubro\n
    Localidad/Ciudad: $localidad\n
    Mensaje:\n$mensaje
    ";

    $headers = "From: $email\r\nReply-To: $email";

    if (mail($destino, "Nuevo mensaje", $contenido, $headers)) {
        echo "¡Gracias! Tu mensaje ha sido enviado correctamente. Te responderemos a la brevedad.";
    } else {
        echo "Error al enviar el mensaje.";
    }
} else {
    echo "Acceso no permitido.";
}
?>