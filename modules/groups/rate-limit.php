<?php
declare(strict_types=1);
// Fixed windows, shared across sessions and PHP workers. No raw IP is stored.
function rateLimit(string $action,int $limit): void {
 $now=time();$window=900;$bucket=hash('sha256',$action.'|'.($_SERVER['REMOTE_ADDR']??'unknown'));
 $pdo=db();$pdo->beginTransaction();
 query('INSERT IGNORE INTO request_limits (bucket,window_start,attempts) VALUES (?,?,0)',[$bucket,$now]);
 $row=query('SELECT window_start,attempts FROM request_limits WHERE bucket=? FOR UPDATE',[$bucket])->fetch();
 $start=(int)$row['window_start'];$attempts=(int)$row['attempts'];
 if($now-$start>=$window){$start=$now;$attempts=0;}
 if($attempts>=$limit){$pdo->commit();header('Retry-After: '.max(1,$window-($now-$start)));fail(429,'Demasiados intentos. Inténtalo más tarde.');}
 query('UPDATE request_limits SET window_start=?,attempts=? WHERE bucket=?',[$start,$attempts+1,$bucket]);$pdo->commit();
 query('DELETE FROM request_limits WHERE window_start<?',[$now-86400]);
}
