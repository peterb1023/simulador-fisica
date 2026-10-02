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

 function getSimDisplayName(id){
  const norm=String(id||'').trim();
  const pad=norm.length===1?'0'+norm:norm;
  return SIMULATOR_NAMES[pad]||SIMULATOR_NAMES[norm]||('Simulador '+pad);
 }

 function getSimBadge(id){
  const norm=String(id||'').trim();
  const pad=norm.length===1?'0'+norm:norm;
  return 'SIM '+pad;
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
   if(!Number.isFinite(val))return '—';
   if(Number.isInteger(val))return String(val);
   const abs=Math.abs(val);
   if(abs>=1e6||(abs<1e-4&&abs>0)){
    return val.toExponential(3);
   }
   return String(Number(val.toFixed(3)));
  }
  if(typeof val==='boolean'){
   return val?'Sí':'No';
  }
  if(val===null||val===undefined){
   return '—';
  }
  if(Array.isArray(val)){
   return val.map(formatValue).join(', ');
  }
  if(typeof val==='object'){
   const entries=Object.entries(val);
   if(!entries.length)return '—';
   return entries.map(([k,v])=>`${k}: ${formatValue(v)}`).join('; ');
  }
  return String(val);
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
  if($('user-nav'))$('user-nav').hidden=!s.user;
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
   li.className='groups-empty-msg';
   li.textContent='Aún no perteneces a ningún grupo. Crea uno o únete con un código de invitación.';
   $('groups').append(li);
   $('group').hidden=true;
   group=null;
   return;
  }
  for(const g of data.groups){
   const li=document.createElement('li');
   li.className='group-item';
   const b=document.createElement('button');
   b.type='button';
   b.className='group-tile'+(Number(g.id)===Number(group)?' active':'');

   const nameRow=document.createElement('div');
   nameRow.className='group-tile-title';
   nameRow.textContent=g.nombre;

   const metaRow=document.createElement('div');
   metaRow.className='group-tile-meta';
   const membersCount=g.num_miembros??1;
   metaRow.textContent='👥 '+membersCount+' integrante'+(Number(membersCount)===1?'':'s');

   b.append(nameRow,metaRow);
   b.addEventListener('click',()=>open(Number(g.id)).catch(report));
   li.append(b);
   $('groups').append(li);
  }
  // Auto-open first group if none open
  if(!group&&data.groups[0]){
   open(Number(data.groups[0].id)).catch(report);
  }
 }

 function renderKVColumn(parent,title,data,limit=null){
  const col=document.createElement('div');
  col.className='sim-col';
  const h=document.createElement('h5');
  h.className='sim-col-title';
  h.textContent=title;
  col.append(h);

  const keys=data&&typeof data==='object'&&!Array.isArray(data)?Object.keys(data):[];
  if(!keys.length){
   const none=document.createElement('p');
   none.className='kv-none';
   none.textContent='Sin datos';
   col.append(none);
   parent.append(col);
   return {col,hasExtra:false};
  }

  const dl=document.createElement('dl');
  dl.className='kv-list';

  const visibleKeys=limit?keys.slice(0,limit):keys;
  const extraKeys=limit?keys.slice(limit):[];

  for(const k of visibleKeys){
   const row=document.createElement('div');
   row.className='kv-row';
   const dt=document.createElement('dt');
   dt.textContent=String(k);
   const dd=document.createElement('dd');
   dd.textContent=formatValue(data[k]);
   row.append(dt,dd);
   dl.append(row);
  }

  let extraDl=null;
  if(extraKeys.length){
   extraDl=document.createElement('dl');
   extraDl.className='kv-list kv-extra';
   extraDl.hidden=true;
   for(const k of extraKeys){
    const row=document.createElement('div');
    row.className='kv-row';
    const dt=document.createElement('dt');
    dt.textContent=String(k);
    const dd=document.createElement('dd');
    dd.textContent=formatValue(data[k]);
    row.append(dt,dd);
    extraDl.append(row);
   }
  }

  col.append(dl);
  if(extraDl)col.append(extraDl);
  parent.append(col);
  return {col,hasExtra:extraKeys.length>0,extraDl};
 }

 function renderSimulations(){
  const container=$('saved');
  container.replaceChildren();

  if($('sims-count-badge')){
   $('sims-count-badge').textContent=simulations.length+' guardada'+(simulations.length===1?'':'s');
  }

  if(!simulations.length){
   const empty=document.createElement('div');
   empty.className='empty-sims-card';
   const p1=document.createElement('p');
   p1.textContent='Aún no hay simulaciones guardadas en este grupo.';
   const p2=document.createElement('p');
   p2.className='empty-sims-sub';
   p2.textContent='Abre cualquier simulador, experimenta y pulsa «Guardar en grupo» para compartir tus resultados.';
   empty.append(p1,p2);
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
   titleRow.className='sim-card-title-group';

   const title=document.createElement('h4');
   title.className='sim-card-title';
   title.textContent=getSimDisplayName(s.simulador_id);

   const badge=document.createElement('span');
   badge.className='sim-badge';
   badge.textContent=getSimBadge(s.simulador_id);

   titleRow.append(title,badge);

   const metaRow=document.createElement('div');
   metaRow.className='sim-card-meta';

   const author=document.createElement('span');
   author.className='sim-author';
   author.textContent=s.guardado_por||'Estudiante';

   const dot=document.createElement('span');
   dot.className='sim-meta-dot';
   dot.textContent='·';

   const time=document.createElement('time');
   time.className='sim-time';
   time.textContent=formatDateHuman(s.guardado_en);

   metaRow.append(author,dot,time);
   header.append(titleRow,metaRow);

   const body=document.createElement('div');
   body.className='sim-card-body';

   let paramsObj={},resObj={};
   try{paramsObj=typeof s.parametros==='object'&&s.parametros!==null?s.parametros:JSON.parse(s.parametros||'{}');}catch{}
   try{resObj=typeof s.resultado==='object'&&s.resultado!==null?s.resultado:JSON.parse(s.resultado||'{}');}catch{}

   const totalFields=Object.keys(paramsObj).length+Object.keys(resObj).length;
   const limit=totalFields>8?4:null;

   const cParams=renderKVColumn(body,'PARÁMETROS',paramsObj,limit);
   const cRes=renderKVColumn(body,'RESULTADOS',resObj,limit);

   card.append(header,body);

   if(cParams.hasExtra||cRes.hasExtra){
    const extraFooter=document.createElement('div');
    extraFooter.className='sim-card-footer';
    const toggleBtn=document.createElement('button');
    toggleBtn.type='button';
    toggleBtn.className='btn-toggle-details';
    const extraCount=(cParams.extraDl?cParams.extraDl.children.length:0)+(cRes.extraDl?cRes.extraDl.children.length:0);
    toggleBtn.textContent='+ Ver detalles completos ('+extraCount+' campos más)';
    let expanded=false;
    toggleBtn.addEventListener('click',()=>{
     expanded=!expanded;
     if(cParams.extraDl)cParams.extraDl.hidden=!expanded;
     if(cRes.extraDl)cRes.extraDl.hidden=!expanded;
     toggleBtn.textContent=expanded?'- Ocultar detalles':'+ Ver detalles completos ('+extraCount+' campos más)';
    });
    extraFooter.append(toggleBtn);
    card.append(extraFooter);
   }

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

  const countText=data.members.length+' integrante'+(data.members.length===1?'':'s');
  if($('group-members-count'))$('group-members-count').textContent='👥 '+countText;

  // Update active state in sidebar tiles
  for(const item of $('groups').children){
   const b=item.querySelector?item.querySelector('button'):item.children?.[0];
   if(b){
    const isActive=b.querySelector?b.querySelector('.group-tile-title')?.textContent===data.group.nombre:b.textContent.includes(data.group.nombre);
    if(b.classList&&b.classList.toggle)b.classList.toggle('active',isActive);
    else b.className='group-tile'+(isActive?' active':'');
   }
  }

  $('members').replaceChildren();
  for(const m of data.members){
   const li=document.createElement('li');
   li.className='member-chip';
   li.textContent=m.nombre;
   $('members').append(li);
  }

  simulations=data.simulations||[];
  visibleSims=simPageSize;
  renderSimulations();
 }

 // Toggle create/join panels
 if($('btn-toggle-create')){
  $('btn-toggle-create').addEventListener('click',()=>{
   $('create').hidden=!$('create').hidden;
   if(!$('create').hidden)$('join').hidden=true;
  });
 }
 if($('btn-cancel-create')){
  $('btn-cancel-create').addEventListener('click',()=>{$('create').hidden=true;});
 }
 if($('btn-toggle-join')){
  $('btn-toggle-join').addEventListener('click',()=>{
   $('join').hidden=!$('join').hidden;
   if(!$('join').hidden)$('create').hidden=true;
  });
 }
 if($('btn-cancel-join')){
  $('btn-cancel-join').addEventListener('click',()=>{$('join').hidden=true;});
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
    $(action).hidden=true;
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
