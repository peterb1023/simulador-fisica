<?php
declare(strict_types=1);

// Trusted proxy inspection: only trust X-Forwarded-For when REMOTE_ADDR is loopback (127.0.0.1 / ::1).
function clientIp(): string {
 $remote=$_SERVER['REMOTE_ADDR']??'127.0.0.1';
 if($remote==='127.0.0.1'||$remote==='::1'){
  $xff=$_SERVER['HTTP_X_FORWARDED_FOR']??'';
  if($xff!==''){
   $parts=explode(',',$xff,2);
   $candidate=trim($parts[0]);
   if(filter_var($candidate,FILTER_VALIDATE_IP)!==false){
    return $candidate;
   }
  }
 }
 return $remote;
}

function rateLimitBucket(string $action,string $key=''): string {
 $ip=clientIp();
 $raw=$key!==''?($action.'|'.$ip.'|'.$key):($action.'|'.$ip);
 return hash('sha256',$raw);
}

function checkRateLimit(string $action,int $limit,string $key=''): void {
 $now=time();$window=900;
 $bucket=rateLimitBucket($action,$key);
 $row=query('SELECT window_start,attempts FROM request_limits WHERE bucket=?',[$bucket])->fetch();
 if($row){
  $start=(int)$row['window_start'];$attempts=(int)$row['attempts'];
  if($now-$start<$window&&$attempts>=$limit){
   header('Retry-After: '.max(1,$window-($now-$start)));
   fail(429,'Demasiados intentos. Inténtalo más tarde.');
  }
 }
}

function recordRateLimitHit(string $action,string $key=''): void {
 $now=time();$window=900;
 $bucket=rateLimitBucket($action,$key);
 $pdo=db();$pdo->beginTransaction();
 query('INSERT IGNORE INTO request_limits (bucket,window_start,attempts) VALUES (?,?,0)',[$bucket,$now]);
 $row=query('SELECT window_start,attempts FROM request_limits WHERE bucket=? FOR UPDATE',[$bucket])->fetch();
 $start=(int)$row['window_start'];$attempts=(int)$row['attempts'];
 if($now-$start>=$window){$start=$now;$attempts=0;}
 query('UPDATE request_limits SET window_start=?,attempts=? WHERE bucket=?',[$start,$attempts+1,$bucket]);
 $pdo->commit();
 query('DELETE FROM request_limits WHERE window_start<?',[$now-86400]);
}

function clearRateLimit(string $action,string $key=''): void {
 $bucket=rateLimitBucket($action,$key);
 query('DELETE FROM request_limits WHERE bucket=?',[$bucket]);
}

function rateLimit(string $action,int $limit,string $key=''): void {
 $now=time();$window=900;
 $bucket=rateLimitBucket($action,$key);
 $pdo=db();$pdo->beginTransaction();
 query('INSERT IGNORE INTO request_limits (bucket,window_start,attempts) VALUES (?,?,0)',[$bucket,$now]);
 $row=query('SELECT window_start,attempts FROM request_limits WHERE bucket=? FOR UPDATE',[$bucket])->fetch();
 $start=(int)$row['window_start'];$attempts=(int)$row['attempts'];
 if($now-$start>=$window){$start=$now;$attempts=0;}
 if($attempts>=$limit){
  $pdo->commit();
  header('Retry-After: '.max(1,$window-($now-$start)));
  fail(429,'Demasiados intentos. Inténtalo más tarde.');
 }
 query('UPDATE request_limits SET window_start=?,attempts=? WHERE bucket=?',[$start,$attempts+1,$bucket]);
 $pdo->commit();
 query('DELETE FROM request_limits WHERE window_start<?',[$now-86400]);
}
