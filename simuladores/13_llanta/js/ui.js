const UI=(()=>{
 function update(){const c=Engine.getCalc(),box=document.getElementById('results');box.replaceChildren();
  for(const [key,label]of Object.entries({M_1pared:'Masa de una pared (kg)',I_1pared:'Inercia de una pared (kg·m²)',M_h:'Masa de huella (kg)',I_h:'Inercia de huella (kg·m²)',M_total:'Masa total (kg)',I_total:'Inercia total (kg·m²)',K:'Energía cinética (J)'})){const row=document.createElement('p');row.textContent=label+': '+c[key].toPrecision(7);box.append(row);}}
 function boot(){
  for(const input of document.querySelectorAll('[data-param]'))input.addEventListener('change',()=>{try{Engine.set(input.dataset.param,input.valueAsNumber);document.getElementById('input-error').textContent='';update();}catch(e){document.getElementById('input-error').textContent=e.message;input.value=Engine.getState()[input.dataset.param];}});
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab,b)));
  update();Render.init(document.getElementById('canvasMain'));const clock=SimCommon.createClock();
  document.addEventListener('visibilitychange',()=>clock.reset());
  function frame(){const dt=clock.tick();if(!document.hidden)Engine.step(dt);Render.draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }
 return {boot,update};
})();
function setTab(name,btn){document.querySelectorAll('.tab').forEach(t=>t.style.display='none');document.getElementById('tab-'+name).style.display='block';document.querySelectorAll('.sim-nav .nav-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');}
document.addEventListener('DOMContentLoaded',UI.boot);
