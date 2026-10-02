(()=>{
 const $=id=>document.getElementById(id);
 let token='',group=null,currentUser=null,simulations=[],visibleSims=10;
 const simPageSize=10;

 const SIMULATOR_NAMES={
  '01':'Energía','1':'Energía',
  '02':'Vectores','2':'Vectores',
  '03':'Unidades y conversiones','3':'Unidades y conversiones',
  '04':'Cinemática 1D','4':'Cinemática 1D',
  '05':'MRU / MRUA','5':'MRU / MRUA',
  '06':'Tiro parabólico','6':'Tiro parabólico',
  '07':'Movimiento circular','7':'Movimiento circular',
  '08':'Leyes de Newton y fricción','8':'Leyes de Newton y fricción',
  '09':'Trabajo','9':'Trabajo',
  '10':'Potencia y eficiencia','10':'Potencia y eficiencia',
  '11':'Movimiento rotacional','11':'Movimiento rotacional',
  '12':'Momento de inercia','12':'Momento de inercia',
  '13':'Momento de inercia compuesto','13':'Momento de inercia compuesto'
 };

 function formatSimName(id){
  const norm=String(id||'').trim();
  const pad=norm.length===1?'0'+norm:norm;
  const name=SIMULATOR_NAMES[pad]||SIMULATOR_NAMES[norm];
  return name?name+' · SIM '+pad:'Simulador '+pad;
 }

 function formatDateHuman(dateStr){
  if(!dateStr||typeof dateStr!=='string')return '';
  const parts=dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if(!parts)return dateStr;
  const [,y,m,d,h='00',min='00']=parts;
  const months=['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.'];
  const monthName=months[parseInt(m,10)-1]||m;
  const day=parseInt(d,10);
  let hour=parseInt(h,10);
  const minute=min.padStart(2,'0');
  const ampm=hour>=12?'p. m.':'a. m.';
  hour=hour%12;
  if(hour===0)hour=12;
  return `${day} ${monthName} ${y} · ${hour}:${minute} ${ampm}`;
 }

 function formatValue(val){
  if(typeof val==='number'){
   return Number.isInteger(val)?String(val):(Math.abs(val)<0.0001||Math.abs(val)>=100000?val.toExponential(3):String(Number(val.toFixed(4))));
  }
  if(typeof val==='boolean'){
   return val?'Sí':'No';
  }
  if(Array.isArray(val)){
   return val.map(formatValue).join(', ');
  }
  if(typeof val==='object'&&val!==null){
   const entries=Object.entries(val);
   if(!entries.length)return '—';
   return entries.map(([k,v])=>`${k}: ${formatValue(v)}`).join('; ');
  }
  return String(val??'');
 }

 const returnPath=new URLSearchParams(location.search).get('return');
 const root=new URL('../../',location.href);
 let returnURL=null;
 try{
  const u=new URL(returnPath||'',root);
  if(returnPath&&u.origin===root.origin&&u.pathname.startsWith(root.pathname+'simuladores/')&&!u.username&&!u.password){
   returnURL=u;
   $('return-sim').href=u.href;
   $('return-sim').hidden=false;
  }
 }catch{}

 async function api(action,data){
  const r=await fetch('api.php?action='+action,{
   method:data?'POST':'GET',
   headers:data?{'Content-Type':'application/json','X-CSRF-Token':token}:{},
   body:data?JSON.stringify(data):undefined
  });
  const result=await r.json();
  if(!r.ok)throw Error(result.message);
  return result;
 }

 function report(error){$('status').textContent=error.message;}

 async function session(){
  const s=await api('session');
  token=s.csrf;
  currentUser=s.user;
  $('auth').hidden=!!s.user;
  $('workspace').hidden=!s.user;
  if(s.user){
   $('welcome').textContent='Sesión de '+s.user.name;
   await groups();
  }else{
   $('group').hidden=true;
   group=null;
  }
 }

 async function groups(){
  const data=await api('groups');
  $('groups').replaceChildren();
  if(!data.groups.length){
   const li=document.createElement('li');
   li.textContent='Aún no perteneces a ningún grupo. Crea uno o únete con un código.';
   $('groups').append(li);
  }
  for(const g of data.groups){
   const li=document.createElement('li'),b=document.createElement('button');
   b.type='button';
   b.textContent=g.nombre;
   b.addEventListener('click',()=>open(Number(g.id)).catch(report));
   li.append(b);
   $('groups').append(li);
  }
 }

 function renderKV(parent,title,data){
  const sec=document.createElement('div');
  sec.className='sim-section';
  const h=document.createElement('h5');
  h.className='sim-section-title';
  h.textContent=title;
  sec.append(h);

  const keys=data&&typeof data==='object'&&!Array.isArray(data)?Object.keys(data):[];
  if(!keys.length){
   const none=document.createElement('span');
   none.className='kv-none';
   none.textContent='Sin datos';
   sec.append(none);
   parent.append(sec);
   return;
  }

  const dl=document.createElement('dl');
  dl.className='kv-grid';
  for(const k of keys){
   const dt=document.createElement('dt');
   dt.textContent=String(k);
   const dd=document.createElement('dd');
   dd.textContent=formatValue(data[k]);
   dl.append(dt,dd);
  }
  sec.append(dl);
  parent.append(sec);
 }

 function renderSimulations(){
  const container=$('saved');
  container.replaceChildren();
  if(!simulations.length){
   const empty=document.createElement('p');
   empty.className='empty-notice';
   empty.textContent='Aún no hay simulaciones guardadas en este grupo. Entra a un simulador y pulsa «Guardar en grupo».';
   container.append(empty);
   return;
  }

  const toShow=simulations.slice(0,visibleSims);
  for(const s of toShow){
   const card=document.createElement('article');
   card.className='sim-card';

   const header=document.createElement('header');
   header.className='sim-card-header';

   const titleRow=document.createElement('div');
   titleRow.className='sim-title-row';

   const title=document.createElement('h4');
   title.className='sim-title';
   title.textContent=formatSimName(s.simulador_id);

   const author=document.createElement('span');
   author.className='sim-author';
   author.textContent=s.guardado_por||'Estudiante';

   titleRow.append(title,author);

   const time=document.createElement('time');
   time.className='sim-time';
   time.textContent=formatDateHuman(s.guardado_en);

   header.append(titleRow,time);

   const body=document.createElement('div');
   body.className='sim-card-body';

   let paramsObj={},resObj={};
   try{paramsObj=typeof s.parametros==='object'&&s.parametros!==null?s.parametros:JSON.parse(s.parametros||'{}');}catch{}
   try{resObj=typeof s.resultado==='object'&&s.resultado!==null?s.resultado:JSON.parse(s.resultado||'{}');}catch{}

   renderKV(body,'Parámetros',paramsObj);
   renderKV(body,'Resultados',resObj);

   card.append(header,body);
   container.append(card);
  }

  if(simulations.length>visibleSims){
   const moreBtn=document.createElement('button');
   moreBtn.type='button';
   moreBtn.className='btn-load-more';
   moreBtn.textContent='Ver más simulaciones ('+(simulations.length-visibleSims)+' restantes)';
   moreBtn.addEventListener('click',()=>{
    visibleSims+=simPageSize;
    renderSimulations();
   });
   container.append(moreBtn);
  }
 }

 async function open(id){
  const data=await api('group&id='+id);
  group=id;
  $('group').hidden=false;
  $('leave').hidden=Number(data.group.lider_id)===Number(currentUser.id);
  $('group-title').textContent=data.group.nombre;
  $('code').textContent=data.group.codigo;
  if($('copy-status'))$('copy-status').textContent='';

  $('members').replaceChildren();
  for(const m of data.members){
   const li=document.createElement('li');
   li.textContent=m.nombre;
   $('members').append(li);
  }

  simulations=data.simulations||[];
  visibleSims=simPageSize;
  renderSimulations();
 }

 if($('copy-code')){
  $('copy-code').addEventListener('click',async()=>{
   const code=$('code').textContent.trim();
   if(!code)return;
   try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
     await navigator.clipboard.writeText(code);
    }else{
     const t=document.createElement('textarea');
     t.value=code;t.style.position='fixed';t.style.opacity='0';
     document.body.append(t);t.select();document.execCommand('copy');t.remove();
    }
    if($('copy-status'))$('copy-status').textContent='¡Código copiado al portapapeles!';
    $('copy-code').textContent='¡Copiado!';
    setTimeout(()=>{
     $('copy-code').textContent='Copiar código';
     if($('copy-status'))$('copy-status').textContent='';
    },2500);
   }catch{
    if($('copy-status'))$('copy-status').textContent='No se pudo copiar automáticamente. Copia el texto manualmente.';
   }
  });
 }

 $('account').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const data=Object.fromEntries(new FormData(e.target)),action='login';
   const result=await api(action,data);
   e.target.reset();
   $('status').textContent=result.message||'Sesión iniciada.';
   await session();
   if(returnURL)location.assign(returnURL.href);
  }catch(err){report(err);}
 });

 for(const action of ['create','join']){
  $(action).addEventListener('submit',async e=>{
   e.preventDefault();
   try{
    const r=await api(action,Object.fromEntries(new FormData(e.target)));
    e.target.reset();
    await groups();
    await open(r.id);
    $('status').textContent='Grupo actualizado.';
   }catch(err){report(err);}
  });
 }

 $('leave').addEventListener('click',async()=>{
  try{
   await api('leave',{grupo_id:group});
   group=null;
   $('group').hidden=true;
   await groups();
  }catch(err){report(err);}
 });

 $('logout').addEventListener('click',async()=>{
  try{
   await api('logout',{});
   group=null;
   $('group').hidden=true;
   await session();
   $('status').textContent='Sesión cerrada.';
  }catch(err){report(err);}
 });

 session().catch(report);
})();
