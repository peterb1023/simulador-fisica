const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const http=require('node:http');
function get(url){return new Promise((resolve,reject)=>{http.get(url,{agent:false},res=>{let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,type:res.headers['content-type']||'',body}));}).on('error',reject);});}
const base=process.env.SIM_BASE_URL||'http://127.0.0.1:8765/';
const dirs=fs.readdirSync(path.join(__dirname,'../simuladores'),{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);
const pages=['index.php',...dirs.map(d=>'simuladores/'+d+'/index.php'),'extras/simulador_ABS.html','extras/simulador_transporte.html'];
(async()=>{
 const seen=new Set(),broken=[];let count=0;
 async function check(url){
  if(seen.has(url)||!url.startsWith(base))return;seen.add(url);
  const response=await get(url);if(response.status>=400){broken.push([url,response.status]);return;}count++;
  const type=response.type;if(!/text\/(html|css)/.test(type))return;
  const body=response.body;assert.ok(!/Fatal error:|Parse error:/.test(body),url);
  const refs=[...body.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]);
  if(type.includes('css'))refs.push(...[...body.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m=>m[1]));
  for(const ref of refs){if(/^(#|data:|mailto:|javascript:)/.test(ref))continue;const u=new URL(ref,url);u.hash='';await check(u.href);}
 }
 for(const page of pages)await check(new URL(page,base).href);
 assert.deepEqual(broken,[]);console.log(`PASS: ${pages.length} pages, ${count} local pages/assets, no broken local references.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
