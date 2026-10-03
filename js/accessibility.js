document.addEventListener('DOMContentLoaded',()=>{
 const message=document.createElement('div');message.className='validation-message';message.setAttribute('role','alert');document.body.append(message);
 let serial=0;
 function labelControls(){
  document.querySelectorAll('input,select').forEach(el=>{
   if(!el.id)el.id='control-accessible-'+(++serial);
   if(el.labels&&el.labels.length){el.labels[0].htmlFor=el.id;return;}
   if(el.getAttribute('aria-label'))return;
   const prev=el.previousElementSibling;
   const group=el.closest('.inp-group,.sl-row,.ps,[class^="sl-row"]')||el.parentElement;
   const candidate=prev&&/label|axis/.test(prev.className)?prev:group.querySelector('label,.ps-label,.inp-label');
   const label=document.createElement('label');label.htmlFor=el.id;label.className='sr-only';
   label.textContent=(candidate?.textContent||el.title||el.id.replace(/^(sl|inp|sel)-/,'').replaceAll('-',' ')).trim();
   el.before(label);
  });
  document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('aria-label')){
   const text=b.textContent.trim();const names={'⏮':'Volver al inicio','⏸':'Pausar','▶':'Reproducir','✕':'Eliminar vector','➕':'Acercar','➖':'Alejar'};
   b.setAttribute('aria-label',b.title||names[text]||text);
  }});
 }
 labelControls();
 // Los controles vectoriales se crean dinámicamente.
 const vectors=document.getElementById('vectors-list')||document.querySelector('#tab-sim .panel-left');
 if(vectors)new MutationObserver(()=>labelControls()).observe(vectors,{childList:true,subtree:true});
 document.addEventListener('input',e=>{
  if(!e.target.matches('input[type=number]'))return;
  e.target.setCustomValidity('');
  if(e.target.value===''||!Number.isFinite(e.target.valueAsNumber)||!e.target.validity.valid){
   message.textContent='Introduce un valor numérico válido dentro del rango indicado.';
   e.stopImmediatePropagation();e.target.setAttribute('aria-invalid','true');return;
  }
  e.target.removeAttribute('aria-invalid');message.textContent='';
 },true);
 window.addEventListener('error',e=>{if(e.error instanceof RangeError){message.textContent=e.error.message;e.preventDefault();}});
 const canvas=document.querySelector('canvas');
 if(canvas){
  const summary=document.createElement('details');summary.className='canvas-summary';
  const title=document.createElement('summary');title.textContent='Resumen textual de la simulación';
  const text=document.createElement('p');text.id='canvas-description';summary.append(title,text);
  (canvas.closest('main')||canvas.parentElement).append(summary);
  document.querySelectorAll('canvas').forEach(c=>{c.setAttribute('role','img');c.setAttribute('aria-label','Representación de la simulación');c.setAttribute('aria-describedby','canvas-description');});
  const units={t:'s',x:'m',y:'m',v:'m/s',vx:'m/s',vy:'m/s',Ep:'J',Ec:'J',Eth:'J',omega:'rad/s',theta:'rad',ax:'m/s²',ay:'m/s²',I:'kg·m²',I_P:'kg·m²',W:'J',n:'N',fricSigned:'N'};
  function update(){
   if(typeof Engine==='undefined')return;
   if(Engine.getVectors){text.textContent=Engine.getVectors().map(v=>`${v.name}: (${v.vx}, ${v.vy}) u; módulo ${v.r.toFixed(2)} u; ángulo ${v.theta.toFixed(2)}°`).join('. ');return;}
   const s=Engine.getState();
   if(s.modo==='plano'||s.modo==='elevador')units.theta='°';
   for(const id of ['btn-pause','btn-tl-play']){const b=document.getElementById(id);if(b)b.setAttribute('aria-label',s.paused||s.ended?'Reproducir':'Pausar');}
   let values=Object.entries(units).filter(([key])=>Number.isFinite(s[key])).map(([key,unit])=>`${key}=${s[key].toFixed(2)} ${unit}`);
   if(s.calc)values.push(`Trabajo=${s.calc.W.toFixed(2)} J`);
   if(s.mru)values.push(`MRU x=${s.mru.x.toFixed(2)} m; MRUA x=${s.mrua.x.toFixed(2)} m, v=${s.mrua.v.toFixed(2)} m/s`);
   if('resultado' in s)values.push(s.error||`Resultado: ${s.resultado} ${{P:'W',Fv:'W',W:'J',t:'s'}[s.modo]}`);
   if(s.regime)values.push(`Fricción ${s.regime}`);
   text.textContent=values.join('; ');
  }
  update();setInterval(update,500);
 }
 const tabFormulas=document.getElementById('tab-formulas');
 if(tabFormulas){
  const syncFormulasState=()=>{
   const active=tabFormulas.classList.contains('active')||(tabFormulas.style.display!=='none'&&tabFormulas.style.display!=='');
   document.body.classList.toggle('formulas-active',!!active);
  };
  syncFormulasState();
  new MutationObserver(syncFormulasState).observe(tabFormulas,{attributes:true,attributeFilter:['style','class']});
 }
});
