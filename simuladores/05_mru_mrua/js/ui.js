// ============================================================
//  UI — Controles, sliders, timeline y resolución en vivo
// ============================================================

function updatePanel(sust){
  function build(s,c){return`<div class="step-formula">${s.formula}</div><div class="step-sust">${s.sust}</div><div class="step-res" style="color:${c}">${s.res}</div>`;}
  ['sust-mru-pos','sust-mru-vel','sust-mrua-vel','sust-mrua-pos'].forEach((id,i)=>{
    const el=document.getElementById(id); if(!el) return;
    const [s,c]=[[sust.mru_pos,'#58a6ff'],[sust.mru_vel,'#3fb950'],[sust.mrua_vel,'#e3b341'],[sust.mrua_pos,'#f0883e']][i];
    el.innerHTML=build(s,c);
  });
}

function syncVal(id,val,unit){
  const el=document.getElementById(id);
  if(el) el.innerHTML=`<b>${Engine.fmt(+val)}</b> <span>${unit}</span>`;
}

function syncPlayBtn(){
  const st=Engine.getState();
  const btn=document.getElementById('btn-tl-play');
  if(btn) btn.textContent=st.paused?'▶':'⏸';
}

function bind(id,fn){
  const el=document.getElementById(id);
  if(el) el.addEventListener('input',e=>fn(e.target.value));
}

function resetTimeline(){
  const tl=document.getElementById('timeline');
  const st=Engine.getState();
  if(tl){tl.max=st.tMax;tl.value=0;tl.step='0.02';tl._dragging=false;}
  const tlMax=document.getElementById('tl-max'); if(tlMax) tlMax.textContent=st.tMax+' s';
  const tlTime=document.getElementById('tl-time'); if(tlTime) tlTime.textContent='0.00';
}

function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Si volvemos al sim, aseguramos que el canvas tiene tamaño correcto
  if (name === 'sim') setTimeout(() => Renderer.resize(), 50);
}

function togglePause(){
  const st=Engine.getState();
  if(st.ended){Engine.init();const tl=document.getElementById('timeline');if(tl){tl.value=0;tl._dragging=false;}}
  else Engine.togglePause();
  syncPlayBtn();
}

function resetSim(){
  Engine.init();
  const tl=document.getElementById('timeline');
  if(tl){tl.value=0;tl._dragging=false;}
  syncPlayBtn();
}

function toggleCaida(cb){
  Engine.setModoCaida(cb.checked);
  const slA=document.getElementById('sl-mrua-a'), rowA=document.getElementById('row-mrua-a');
  if(slA) slA.disabled=cb.checked;
  if(rowA) rowA.style.opacity=cb.checked?'0.35':'1';
  resetTimeline();
}

document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    Renderer.init(); Engine.init();

    // Sliders
    bind('sl-mru-x0',  v=>{Engine.setMruX0(+v);  syncVal('val-mru-x0',v,'m');    resetTimeline();});
    bind('sl-mru-v',   v=>{Engine.setMruV(+v);   syncVal('val-mru-v',v,'m/s');   resetTimeline();});
    bind('sl-mrua-x0', v=>{Engine.setMruaX0(+v); syncVal('val-mrua-x0',v,'m');   resetTimeline();});
    bind('sl-mrua-v0', v=>{Engine.setMruaV0(+v); syncVal('val-mrua-v0',v,'m/s'); resetTimeline();});
    bind('sl-mrua-a',  v=>{Engine.setMruaA(+v);  syncVal('val-mrua-a',v,'m/s²'); resetTimeline();});

    // tMax
    const elT=document.getElementById('sl-t');
    if(elT){
      const applyT=()=>{const t=Math.max(1,Math.floor(+elT.value)||8);elT.value=t;Engine.setTMax(t);resetTimeline();};
      elT.addEventListener('change',applyT); elT.addEventListener('input',applyT);
    }

    // Timeline scrubber
    const tl=document.getElementById('timeline');
    if(tl){
      tl._dragging=false;
      tl.addEventListener('pointerdown',()=>{tl._dragging=true;});
      window.addEventListener('pointerup',()=>{tl._dragging=false;});
      window.addEventListener('pointercancel',()=>{tl._dragging=false;});
      tl.addEventListener('input',e=>{
        if(!Engine.getState().paused){Engine.togglePause();syncPlayBtn();}
        const targetT=parseFloat(e.target.value); Engine.seekTo(targetT);
        const tlTime=document.getElementById('tl-time'); if(tlTime) tlTime.textContent=targetT.toFixed(2);
      });
      tl.max=Engine.getState().tMax; tl.value=0;
    }

    const st=Engine.getState();
    const tlMax=document.getElementById('tl-max'); if(tlMax) tlMax.textContent=st.tMax+' s';
    syncPlayBtn(); Renderer.start();
  },80);
});