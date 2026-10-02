<?php
declare(strict_types=1);
if(getenv('SIM_DEMO')==='1'){ini_set('display_errors','0');ini_set('log_errors','1');}
function fail(int $status,string $message): never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode(['ok'=>false,'message'=>$message]);exit;}
require_once __DIR__.'/config.php';
if (!(groupsConfig()['enabled'] ?? false)) fail(503,'Módulo de grupos desactivado.');
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
if (!$secure && !in_array($_SERVER['REMOTE_ADDR'] ?? '',['127.0.0.1','::1'],true)) fail(403,'Se requiere HTTPS.');
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_name('FISICAGROUPS');
session_set_cookie_params(['lifetime'=>0,'path'=>rtrim(str_replace('\\','/',dirname($_SERVER['SCRIPT_NAME'])),'/').'/', 'secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
session_start();
if (isset($_SESSION['last_seen']) && time()-$_SESSION['last_seen']>1800) {$_SESSION=[];session_regenerate_id(true);}
$_SESSION['last_seen']=time();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
function db(): PDO {
 static $pdo=null;if($pdo)return $pdo;
 $pdo=groupsConnection();$GLOBALS['groupsPDO']=$pdo;return $pdo;
}
function query(string $sql,array $args=[]): PDOStatement {$q=db()->prepare($sql);$q->execute($args);return $q;}
function uid(): int {if(empty($_SESSION['uid']))fail(401,'No autenticado.');$id=(int)$_SESSION['uid'];if(!query('SELECT id FROM usuarios WHERE id=? AND activo=1',[$id])->fetchColumn()){unset($_SESSION['uid']);fail(401,'Cuenta no disponible.');}return $id;}
function csrf(): void {if(!hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_CSRF_TOKEN']??''))fail(403,'CSRF inválido.');}
function textField(array $data,string $key,int $min,int $max): string {
 $v=$data[$key]??null;if(!is_string($v)||strlen(trim($v))<$min||strlen($v)>$max||str_contains($v,"\0"))fail(400,'Campo inválido: '.$key);return trim($v);
}
function groupId(mixed $v): int {if(!is_int($v)||$v<1)fail(400,'Grupo inválido.');return $v;}
function member(int $g,int $u): array {$row=query('SELECT g.* FROM grupos g JOIN grupo_miembros m ON m.grupo_id=g.id WHERE g.id=? AND m.usuario_id=?',[$g,$u])->fetch();if(!$row)fail(403,'Grupo no autorizado.');return $row;}
function snapshot(mixed $v): string {
 if(!$v instanceof stdClass||count(get_object_vars($v))>1100)fail(400,'La captura debe ser un objeto de valores simples.');
 foreach($v as $key=>$value){if(strlen((string)$key)>100||in_array($key,['__proto__','constructor','prototype'],true))fail(400,'Clave inválida.');if(!(is_null($value)||is_bool($value)||is_string($value)||is_int($value)||is_float($value))||(is_string($value)&&strlen($value)>4096)||(is_float($value)&&!is_finite($value)))fail(400,'Valor de captura inválido.');}
 $json=json_encode($v,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE);if(strlen($json)>32768)fail(413,'Captura demasiado grande.');return $json;
}
function esc(string $s): string{return htmlspecialchars($s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
