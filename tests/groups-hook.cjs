const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El{constructor(tag){this.tag=tag;this.children=[];this.events={};this.value='';this.textContent='';this.className='';}append(...a){this.children.push(...a);if(this.tag==='select'&&!this.value)this.value=a[0]?.value;}replaceChildren(){this.children=[];}setAttribute(k,v){this[k]=v;}addEventListener(k,v){this.events[k]=v;}showModal(){this.open=true;}close(){this.open=false;}set innerHTML(v){throw Error('unsafe HTML');}}
const nav=new El('nav'),body=new El('body'),requests=[];let live=5,signedIn=true,hasGroups=true,shouldFail=false;const attack='<svg onload=alert(1)>';
const ctx=vm.createContext({URL,clearTimeout,setTimeout:(fn,ms)=>{fn();return 1;},location:{href:'http://localhost/prefix/simuladores/13_llanta/'},document:{currentScript:{src:'http://localhost/prefix/js/sim-groups.js'},querySelector:()=>nav,body,createElement:t=>new El(t)},fetch:async(url,options)=>{requests.push({url:String(url),options});if(shouldFail&&options?.method==='POST')return {ok:false,status:500,json:async()=>({message:'Fallo simulado de servidor'})};return {ok:true,json:async()=>String(url).endsWith('session')?{csrf:'fake',user:signedIn?{id:1}:null}:String(url).endsWith('groups')?{groups:hasGroups?[{id:7,nombre:attack}]:[]}:{ok:true}};}});
const hook=vm.runInContext(fs.readFileSync('js/sim-groups.js','utf8')+';SimGroups',ctx);hook.bind(()=>({parameters:{m:live},results:{I:10}}),'13');
(async()=>{
 assert.equal(requests.length,0);
 await nav.children[0].events.click();
 const dialog=body.children[0],status=dialog.children[1],select=dialog.children[2].children[0],submit=dialog.children[4];
 assert.equal(select.children[0].textContent,attack);
 assert.equal(requests.filter(r=>r.options.method==='POST').length,0);
 live=9;
 // Click submit once
 await submit.events.click();
 const postReqs=requests.filter(r=>r.options?.method==='POST');
 assert.equal(postReqs.length,1,'Exact one POST request dispatched');
 const r=postReqs[0],data=JSON.parse(r.options.body);
 assert.equal(data.parametros.m,5);
 assert.equal(data.grupo_id,7);
 assert.equal(data.simulador_id,'13');
 assert.equal(r.options.headers['X-CSRF-Token'],'fake');
 assert.match(r.url,/prefix\/modules\/groups\/api.php/);
 // Success feedback & button state
 assert.equal(submit.disabled,true);
 assert.equal(submit.textContent,'✓ Guardado');
 assert.equal(status.textContent,'✓ Simulación guardada en «'+attack+'»');
 assert.equal(status.className,'status-success');

 // Reopening resets button text and status
 await nav.children[0].events.click();
 assert.equal(submit.textContent,'Confirmar guardado');
 assert.equal(submit.disabled,false);

 // Test error handling & recovery
 shouldFail=true;
 await submit.events.click();
 assert.equal(submit.disabled,false,'Button re-enabled after failure for retry');
 assert.equal(submit.textContent,'Confirmar guardado');
 assert.ok(status.textContent.includes('Fallo simulado de servidor'));
 assert.equal(status.className,'status-error');
 shouldFail=false;

 // Anonymous state
 signedIn=false;
 await nav.children[0].events.click();
 assert.equal(dialog.children[2].hidden,true);
 assert.equal(submit.hidden,true);
 assert.equal(dialog.children[6].textContent,'Iniciar sesión');
 assert.match(dialog.children[6].href,/return=/);

 // Signed in without groups
 signedIn=true;
 hasGroups=false;
 await nav.children[0].events.click();
 assert.equal(submit.hidden,true);
 assert.equal(dialog.children[2].hidden,true);
 assert.equal(dialog.children[6].textContent,'Gestionar grupos');

 console.log('PASS: shared group hook confirmation feedback, double-click protection, error recovery, snapshot isolation, relative URL, CSRF, inert names.');
})().catch(e=>{console.error(e);process.exitCode=1;});
