<?php
declare(strict_types=1);
function groupsConfig(): array {
 $root=dirname(__DIR__,2);$file=$root.'/config/database.php';
 $cfg=require is_file($file)?$file:$root.'/config/database.example.php';
 foreach(['dsn'=>'SIM_DB_DSN','user'=>'SIM_DB_USER','password'=>'SIM_DB_PASSWORD','enabled'=>'SIM_GROUPS_ENABLED'] as $key=>$env){$value=getenv($env);if($value!==false)$cfg[$key]=$key==='enabled'?$value==='1':$value;}
 return $cfg;
}
function groupsConnection(): PDO {
 $cfg=groupsConfig();
 if(!str_starts_with($cfg['dsn']??'','mysql:')||empty($cfg['user'])||strtolower($cfg['user'])==='root'||empty($cfg['password']))throw new RuntimeException('Configura una cuenta de base de datos dedicada con contraseña.');
 return new PDO($cfg['dsn'],$cfg['user'],$cfg['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);
}
