document.addEventListener('DOMContentLoaded', () => {
  const bar=document.querySelector('[data-timeline]'); if(!bar) return;
  const slider=bar.querySelector('input'),play=bar.querySelector('[data-play]'),reset=bar.querySelector('[data-reset]'),out=bar.querySelector('output');
  const pause=()=>{if(Engine.pause)Engine.pause();else if(!Engine.getState().paused)Engine.togglePause();};
  const resume=()=>{if(Engine.resume)Engine.resume();else if(Engine.getState().paused)Engine.togglePause();};
  const sync=()=>{const s=Engine.getState();slider.max=s.tMax; if(!slider._dragging)slider.value=s.t;
    out.textContent=`${s.t.toFixed(2)} / ${s.tMax.toFixed(2)} s`;
    play.textContent=s.paused||s.ended?'▶':'⏸';play.setAttribute('aria-label',s.paused||s.ended?'Reproducir':'Pausar');};
  play.addEventListener('click',()=>{const s=Engine.getState();if(s.ended){Engine.seekTo(0);resume();}else if(s.paused)resume();else pause();sync();});
  reset.addEventListener('click',()=>{Engine.seekTo(0);pause();sync();});
  slider.addEventListener('pointerdown',()=>{slider._dragging=true;pause();});
  for(const event of ['pointerup','pointercancel'])window.addEventListener(event,()=>{slider._dragging=false;sync();});
  slider.addEventListener('input',()=>{pause();Engine.seekTo(+slider.value);sync();});
  // El renderer permanece activo mientras la física está pausada.
  function refresh(){sync();requestAnimationFrame(refresh);}refresh();
});
