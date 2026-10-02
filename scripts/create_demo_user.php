<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
require dirname(__DIR__).'/modules/groups/config.php';
$email=strtolower($argv[1]??'demo1@example.test');$name=$argv[2]??'Estudiante demo';
if(!filter_var($email,FILTER_VALIDATE_EMAIL)||!str_ends_with($email,'@example.test')||strlen($name)<1||strlen($name)>100){fwrite(STDERR,"Uso: php scripts/create_demo_user.php demo1@example.test NombreDemo\n");exit(1);}
try {
 $pdo=groupsConnection();$password=bin2hex(random_bytes(16));
 $q=$pdo->prepare('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)');
 $q->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]);
 echo json_encode(['email'=>$email,'password'=>$password],JSON_THROW_ON_ERROR).PHP_EOL;
} catch(Throwable $e){fwrite(STDERR,"No se creó la cuenta. Comprueba conexión, esquema y que el correo no exista. No se modifica una cuenta existente.\n");exit(1);}
