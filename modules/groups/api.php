<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
function ok(array $data=[]): never {echo json_encode(['ok'=>true]+$data,JSON_THROW_ON_ERROR|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT);exit;}
try {
 $method=$_SERVER['REQUEST_METHOD'];$action=$_GET['action']??'';
 if($method==='GET'){
  if($action==='session')ok(['csrf'=>$_SESSION['csrf'],'user'=>isset($_SESSION['uid'])?['id'=>$_SESSION['uid'],'name'=>$_SESSION['name']]:null]);
  $u=uid();
  if($action==='groups')ok(['groups'=>query('SELECT g.id,g.nombre,g.codigo,g.lider_id FROM grupos g JOIN grupo_miembros m ON m.grupo_id=g.id WHERE m.usuario_id=? ORDER BY g.id DESC LIMIT 100',[$u])->fetchAll()]);
  if($action==='group'){$raw=$_GET['id']??'';if(!is_string($raw)||!ctype_digit($raw))fail(400,'Grupo inválido.');$g=groupId((int)$raw);$group=member($g,$u);ok(['group'=>$group,'members'=>query('SELECT u.nombre FROM usuarios u JOIN grupo_miembros m ON m.usuario_id=u.id WHERE m.grupo_id=? LIMIT 100',[$g])->fetchAll(),'simulations'=>query('SELECT s.id,s.usuario_id,s.simulador_id,s.parametros,s.resultado,s.guardado_en FROM simulaciones s WHERE grupo_id=? ORDER BY id DESC LIMIT 100',[$g])->fetchAll()]);}
  fail(404,'Acción inexistente.');
 }
 if($method!=='POST'){header('Allow: GET, POST');fail(405,'Método no permitido.');}
 csrf();
 if(!str_starts_with(strtolower($_SERVER['CONTENT_TYPE']??''),'application/json'))fail(415,'Se requiere JSON.');
 $raw=file_get_contents('php://input',false,null,0,70001);if(strlen($raw)>70000)fail(413,'Solicitud demasiado grande.');
 try{$object=json_decode($raw,false,16,JSON_THROW_ON_ERROR);}catch(JsonException $e){fail(400,'JSON inválido.');}
 if(!$object instanceof stdClass)fail(400,'Se requiere un objeto JSON.');$data=(array)$object;
 if($action==='register'||$action==='login'){
  $email=strtolower(textField($data,'email',3,254));$password=$data['password']??null;
  if(!filter_var($email,FILTER_VALIDATE_EMAIL)||!is_string($password)||strlen($password)<12||strlen($password)>72||str_contains($password,"\0"))fail(400,'Email inválido o contraseña fuera de 12–72 bytes.');
  if($action==='register'){
   $name=textField($data,'nombre',1,100);
   try{query('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)',[$name,$email,password_hash($password,PASSWORD_DEFAULT)]);}catch(PDOException $e){if($e->getCode()==='23000')fail(409,'No se pudo crear la cuenta con esos datos.');throw $e;}
   ok(['message'=>'Cuenta creada. Inicia sesión.']);
  }
  $user=query('SELECT id,nombre,password_hash FROM usuarios WHERE email=?',[$email])->fetch();
  if(!$user||!password_verify($password,$user['password_hash']))fail(401,'Credenciales incorrectas.');
  session_regenerate_id(true);$_SESSION=['uid'=>(int)$user['id'],'name'=>$user['nombre'],'csrf'=>bin2hex(random_bytes(32)),'last_seen'=>time()];ok(['csrf'=>$_SESSION['csrf']]);
 }
 $u=uid();
 if($action==='logout'){$_SESSION=[];$p=session_get_cookie_params();unset($p['lifetime']);setcookie(session_name(),'',array_merge($p,['expires'=>time()-42000]));session_destroy();ok();}
 if($action==='create'){
  $name=textField($data,'nombre',1,100);$code=bin2hex(random_bytes(16));db()->beginTransaction();query('INSERT INTO grupos (nombre,codigo,lider_id) VALUES (?,?,?)',[$name,$code,$u]);$g=(int)db()->lastInsertId();query('INSERT INTO grupo_miembros (grupo_id,usuario_id) VALUES (?,?)',[$g,$u]);db()->commit();ok(['id'=>$g,'codigo'=>$code]);
 }
 if($action==='join'){
  $code=textField($data,'codigo',32,32);if(!preg_match('/^[a-f0-9]{32}$/D',$code))fail(400,'Código inválido.');$g=query('SELECT id FROM grupos WHERE codigo=?',[$code])->fetchColumn();if(!$g)fail(404,'Código inexistente.');query('INSERT IGNORE INTO grupo_miembros (grupo_id,usuario_id) VALUES (?,?)',[$g,$u]);ok(['id'=>(int)$g]);
 }
 if($action==='leave'||$action==='save'){
  $g=groupId($data['grupo_id']??null);$group=member($g,$u);
  if($action==='leave'){if((int)$group['lider_id']===$u)fail(409,'El propietario debe conservar su pertenencia.');query('DELETE FROM grupo_miembros WHERE grupo_id=? AND usuario_id=?',[$g,$u]);ok();}
  $sim=textField($data,'simulador_id',2,2);if(!preg_match('/^(0[1-9]|1[0-3])$/D',$sim))fail(400,'Simulador inválido.');
  $params=snapshot($data['parametros']??null);$result=snapshot($data['resultado']??null);
  query('INSERT INTO simulaciones (grupo_id,usuario_id,simulador_id,parametros,resultado) VALUES (?,?,?,?,?)',[$g,$u,$sim,$params,$result]);ok(['id'=>(int)db()->lastInsertId()]);
 }
 fail(404,'Acción inexistente.');
}catch(Throwable $e){$connection=$GLOBALS['groupsPDO']??null;if($connection instanceof PDO&&$connection->inTransaction())$connection->rollBack();fail(503,'Servicio de grupos no disponible.');}
