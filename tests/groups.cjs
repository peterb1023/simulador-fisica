// Integration tests against a disposable MariaDB, never the user's database.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),bin=process.env.MARIADB_BIN||'C:/xampp/mysql/bin',php=process.env.PHP_BIN||'C:/xampp/php/php.exe';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fisica-groups-test-')),data=path.join(temp,'data');
const password=crypto.randomBytes(24).toString('hex'),appPassword=crypto.randomBytes(24).toString('hex');
const dbPort=Number(process.env.SIM_TEST_DB_PORT||13379),httpPort=Number(process.env.SIM_TEST_HTTP_PORT||8781);
let db,server;const pause=ms=>new Promise(r=>setTimeout(r,ms));
function sql(query){const r=cp.spawnSync(path.join(bin,'mysql.exe'),['--no-defaults','--host=127.0.0.1','--port='+dbPort,'--user=root','--batch','--skip-column-names'],{input:query,encoding:'utf8',env:{...process.env,MYSQL_PWD:password},windowsHide:true});if(r.status!==0)throw Error('Test DB command failed: '+r.stderr.replaceAll(password,'[redacted]'));return r.stdout;}
async function client(){let cookie='',csrf='';return {get cookie(){return cookie;},set cookie(v){cookie=v;},get csrf(){return csrf;},async request(action,body,options={}){const method=options.method||(body===undefined?'GET':'POST');const response=await fetch(`http://127.0.0.1:${httpPort}/modules/groups/api.php?action=${action}`,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{'Content-Type':'application/json','X-CSRF-Token':options.csrf??csrf}:{})},body:method==='POST'?(options.raw??JSON.stringify(body)):undefined});const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];const value=await response.json();if(value.csrf)csrf=value.csrf;return {status:response.status,value,headers:response.headers};},async init(){return this.request('session');}};}
(async()=>{try{
 const install=cp.spawnSync(path.join(bin,'mysql_install_db.exe'),['--datadir='+data,'--password='+password,'--port='+dbPort,'--silent'],{encoding:'utf8',windowsHide:true});if(install.status!==0)throw Error('Temporary MariaDB initialization failed. '+install.stderr);
 db=cp.spawn(path.join(bin,'mysqld.exe'),['--no-defaults','--basedir='+path.dirname(bin),'--datadir='+data,'--port='+dbPort,'--bind-address=127.0.0.1','--innodb-buffer-pool-size=32M','--console'],{windowsHide:true,stdio:['ignore','ignore','ignore']});
 let ready=false;for(let i=0;i<80;i++){await pause(250);try{sql('SELECT 1');ready=true;break;}catch{}}assert.ok(ready,'temporary DB ready');
 sql(`CREATE DATABASE fisica_test CHARACTER SET utf8mb4; CREATE USER 'fisica_test'@'127.0.0.1' IDENTIFIED BY '${appPassword}'; GRANT SELECT,INSERT,UPDATE,DELETE ON fisica_test.* TO 'fisica_test'@'127.0.0.1'; USE fisica_test;\n`.replace('\\n','\n')+fs.readFileSync(path.join(root,'database/schema.sql'),'utf8'));
 fs.mkdirSync(path.join(temp,'sessions'));
 server=cp.spawn(php,['-d','session.save_path='+path.join(temp,'sessions'),'-S','127.0.0.1:'+httpPort,'-t',root],{cwd:root,windowsHide:true,stdio:['ignore','ignore','ignore'],env:{...process.env,SIM_GROUPS_ENABLED:'1',SIM_DB_DSN:`mysql:host=127.0.0.1;port=${dbPort};dbname=fisica_test;charset=utf8mb4`,SIM_DB_USER:'fisica_test',SIM_DB_PASSWORD:appPassword}});
 const a=await client(),b=await client(),anon=await client();ready=false;for(let i=0;i<60;i++){await pause(100);try{await a.init();ready=true;break;}catch{}}assert.ok(ready,'HTTP ready');await b.init();await anon.init();
 const pass=crypto.randomBytes(18).toString('hex');
 assert.equal((await a.request('register',{nombre:'Estudiante ficticio A',email:'a@example.test',password:pass})).status,200);
 assert.equal((await b.request('register',{nombre:'Estudiante ficticio B',email:'b@example.test',password:pass+'b'})).status,200);
 assert.equal((await a.request('login',{email:'a@example.test',password:'incorrect-password'})).status,401);
 const before=a.cookie;assert.equal((await a.request('login',{email:'a@example.test',password:pass})).status,200);assert.notEqual(a.cookie,before,'session regenerated');
 const stale=await client();stale.cookie=before;assert.equal((await stale.request('groups')).status,401);
 const fixed=await client();fixed.cookie='FISICAGROUPS=attackerfixedsession123456';await fixed.init();assert.notEqual(fixed.cookie,'FISICAGROUPS=attackerfixedsession123456');
 assert.equal((await b.request('login',{email:'b@example.test',password:pass+'b'})).status,200);
 const xss='<img src=x onerror=alert(1)>';const created=await a.request('create',{nombre:xss});assert.equal(created.status,200);const group=created.value.id;
 assert.equal((await b.request('group&id='+group)).status,403);
 const capture={grupo_id:group,simulador_id:'13',parametros:{rho:1100},resultado:{I:1.281393},usuario_id:999999};
 assert.equal((await a.request('save',capture)).status,200);
 assert.equal((await b.request('save',capture)).status,403);
 assert.equal((await anon.request('save',capture)).status,401);
 assert.equal((await a.request('save',capture,{csrf:'invalid'})).status,403);
 assert.equal((await a.request('save',capture,{raw:'{broken'})).status,400);
 assert.equal((await a.request('save',{...capture,simulador_id:'99'})).status,400);
 assert.equal((await a.request('save',{...capture,grupo_id:'1 OR 1=1'})).status,400);
 assert.equal((await a.request('group&id=1%20OR%201=1')).status,400);
 assert.equal((await a.request('save',{...capture,parametros:[1,2]})).status,400);
 assert.equal((await a.request('save',{...capture,parametros:{x:{nested:1}}})).status,400);
 assert.equal((await a.request('save',{...capture,parametros:{x:'x'.repeat(4097)}})).status,400);
 assert.equal((await a.request('save',capture,{raw:JSON.stringify(capture).replace('1100','1e999')})).status,400);
 assert.equal((await a.request('save',capture,{raw:' '.repeat(70001)})).status,413);
 assert.equal((await a.request('create',{nombre:'No CSRF'},{csrf:''})).status,403);
 assert.equal((await anon.request('login',{email:"' OR 1=1 --",password:pass})).status,400);
 const info=await a.request('group&id='+group);assert.equal(info.value.group.nombre,xss);assert.equal(info.value.simulations.length,1);assert.notEqual(Number(info.value.simulations[0].usuario_id),999999);
 const hash=sql("USE fisica_test; SELECT password_hash FROM usuarios WHERE email='a@example.test';").trim();assert.notEqual(hash,pass);assert.ok(hash.startsWith('$2y$')||hash.startsWith('$argon2'));
 assert.equal((await b.request('join',{codigo:created.value.codigo})).status,200);assert.equal((await b.request('save',capture)).status,200);assert.equal((await b.request('leave',{grupo_id:group})).status,200);assert.equal((await b.request('group&id='+group)).status,403);assert.equal((await a.request('leave',{grupo_id:group})).status,409);
 const oldCookie=a.cookie;assert.equal((await a.request('logout',{})).status,200);const replay=await client();replay.cookie=oldCookie;assert.equal((await replay.request('groups')).status,401);
 const newSession=await a.init();assert.match(newSession.headers.get('set-cookie')||'ignored',/HttpOnly|ignored/i);
 assert.equal((await a.request('logout')).status,401);
 const html=await (await fetch(`http://127.0.0.1:${httpPort}/modules/groups/`)).text();assert.ok(!html.includes(xss));
 const ui=fs.readFileSync(path.join(root,'modules/groups/app.js'),'utf8');assert.ok(!/innerHTML|onclick|addslashes/.test(ui));assert.match(ui,/textContent=data.group.nombre/);
 assert.ok(!/INSERT\s+INTO/i.test(fs.readFileSync(path.join(root,'database/schema.sql'),'utf8')));
 console.log('PASS: MariaDB registration/login, fixation, logout, own/foreign group, snapshots, CSRF, invalid JSON/simulator/size, XSS inert output, SQL injection, membership and session user.');
 }finally{
 if(server){server.kill();await new Promise(r=>server.once('exit',r));}
 if(db){try{sql('SHUTDOWN');}catch{}if(db.exitCode===null)await Promise.race([new Promise(r=>db.once('exit',r)),pause(4000)]);if(db.exitCode===null)db.kill();}
 // Only the fresh, verified test directory created above is eligible for cleanup.
 const resolved=path.resolve(temp),parent=path.resolve(os.tmpdir());if(path.dirname(resolved)===parent&&path.basename(resolved).startsWith('fisica-groups-test-')){await pause(300);fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:300});}
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
