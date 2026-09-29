// ============================================================
//  RENDERER — Canvas principal + gráficas x(t) y v(t)
// ============================================================
const Renderer = (() => {
  const clock = SimCommon.createClock();
  let cMain,ctxMain,cX,ctxX,cV,ctxV,animId=null;
  const C={bg:'#0a1628',panel:'#0d1117',grid:'rgba(48,54,61,0.5)',axis:'rgba(88,166,255,0.3)',
    tx2:'#8b949e',tx3:'#484f58',zero:'rgba(248,81,73,0.5)',tCursor:'rgba(88,166,255,0.5)',
    x0mark:'rgba(227,179,65,0.5)',mru:'#58a6ff',mrua:'#f0883e',
    lineX_mru:'#58a6ff',lineX_mrua:'#f0883e',lineV_mru:'#3fb950',lineV_mrua:'#e3b341'};

  function init() {
    cMain=document.getElementById('canvasMain'); cX=document.getElementById('canvasX'); cV=document.getElementById('canvasV');
    ctxMain=cMain.getContext('2d'); ctxX=cX.getContext('2d'); ctxV=cV.getContext('2d');
    resize(); window.addEventListener('resize',resize);
  }
  function resize() {
    [cMain,cX,cV].forEach(c=>{c.width=c.offsetWidth||c.parentElement.offsetWidth; c.height=c.offsetHeight||c.parentElement.offsetHeight;});
  }

  function drawMain(st) {
    const W=cMain.width, H=cMain.height, ctx=ctxMain;
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);

    const MARGIN=44, VIS=60, PPM=(W-MARGIN*2)/VIS, OBJ_PX=W*0.45, RH=4, HALF=Math.floor(H/2);

    const tracks=[
      {y1:0,    y2:HALF, railY:H*0.30, color:C.mru,  label:'MRU',  x:st.mru.x,  x0:st.mru.x0,  v:st.mru.v,  hist:st.mru.histX},
      {y1:HALF, y2:H,    railY:H*0.70, color:C.mrua, label:'MRUA', x:st.mrua.x, x0:st.mrua.x0, v:st.mrua.v, hist:st.mrua.histX},
    ];

    tracks.forEach(({y1,y2,railY,color,label,x,x0,v,hist})=>{
      ctx.save();
      ctx.beginPath(); ctx.rect(0,y1,W,y2-y1); ctx.clip();

      const orig = OBJ_PX - x*PPM;

      // Riel
      ctx.fillStyle=color+'0a'; ctx.fillRect(MARGIN,railY-2,W-MARGIN*2,RH+4);
      ctx.fillStyle=color+'55'; ctx.fillRect(MARGIN,railY,W-MARGIN*2,RH);

      // Marcas de escala
      const visL=(MARGIN-orig)/PPM, visR=(W-MARGIN-orig)/PPM;
      const step=10, ms=Math.ceil(visL/step)*step, me=Math.floor(visR/step)*step;
      ctx.font='9px Space Mono,monospace'; ctx.textAlign='center';
      for(let m=ms;m<=me;m+=step){
        const px=orig+m*PPM; if(px<MARGIN-1||px>W-MARGIN+1) continue;
        ctx.fillStyle=(m===0)?'rgba(248,81,73,0.55)':C.tx3; ctx.fillRect(px-.5,railY-4,1,4+RH+4);
        ctx.fillStyle=(m===0)?'rgba(248,81,73,0.7)':C.tx2; ctx.fillText(m,px,railY+RH+14);
      }
      ctx.textAlign='left'; ctx.fillStyle=C.tx3; ctx.fillText('m',W-MARGIN+6,railY+RH+14);

      // Marcador x0
      const x0px=orig+x0*PPM;
      if(x0px>MARGIN&&x0px<W-MARGIN){
        ctx.strokeStyle=C.x0mark; ctx.lineWidth=1.5; ctx.setLineDash([3,4]);
        ctx.beginPath(); ctx.moveTo(x0px,railY-16); ctx.lineTo(x0px,railY+RH+16); ctx.stroke();
        ctx.setLineDash([]); ctx.font='9px Space Mono,monospace'; ctx.fillStyle=C.x0mark;
        ctx.textAlign='center'; ctx.fillText('x₀',x0px,railY-20); ctx.textAlign='left';
      }

      // Trail
      hist.slice(-70).forEach((p,i,arr)=>{
        const alpha=(i/arr.length)*0.35, px=orig+p.x*PPM;
        if(px<MARGIN||px>W-MARGIN) return;
        ctx.beginPath(); ctx.arc(px,railY+RH/2,3,0,Math.PI*2);
        ctx.fillStyle=color+Math.round(alpha*255).toString(16).padStart(2,'0'); ctx.fill();
      });

      // Objeto (siempre en OBJ_PX)
      const objY=railY+RH/2, R=13;
      ctx.beginPath(); ctx.ellipse(OBJ_PX,railY+RH+3,R*.7,2.5,0,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fill();
      const grd=ctx.createRadialGradient(OBJ_PX,objY,0,OBJ_PX,objY,R*2.5);
      grd.addColorStop(0,color+'40'); grd.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(OBJ_PX,objY,R*2.5,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      ctx.beginPath(); ctx.arc(OBJ_PX,objY,R,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
      ctx.beginPath(); ctx.arc(OBJ_PX,objY,R-3,0,Math.PI*2); ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1.5; ctx.stroke();

      // Flecha velocidad
      const vLen=Math.sign(v)*Math.min(Math.abs(v)*PPM*.45,80);
      if(Math.abs(vLen)>2){
        const dir=vLen>0?1:-1, al=Math.abs(vLen);
        ctx.strokeStyle=color; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(OBJ_PX,objY-R-6); ctx.lineTo(OBJ_PX+dir*al,objY-R-6); ctx.stroke();
        ctx.fillStyle=color; ctx.beginPath();
        ctx.moveTo(OBJ_PX+dir*al,objY-R-6); ctx.lineTo(OBJ_PX+dir*(al-7),objY-R-10); ctx.lineTo(OBJ_PX+dir*(al-7),objY-R-2);
        ctx.closePath(); ctx.fill();
      }

      // Labels
      ctx.font='bold 10px Space Mono,monospace'; ctx.textAlign='center'; ctx.fillStyle=color;
      ctx.fillText(`x = ${Engine.fmt(x)} m`,   OBJ_PX, objY-R-22);
      ctx.fillText(`v = ${Engine.fmt(v)} m/s`, OBJ_PX, objY-R-36);
      ctx.textAlign='left'; ctx.font='bold 10px Syne,sans-serif'; ctx.fillStyle=color;
      ctx.fillText(label, MARGIN, railY-22);

      ctx.restore();
    });

    // Separador central
    ctx.strokeStyle='rgba(48,54,61,.5)'; ctx.lineWidth=1; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.moveTo(MARGIN,H*.5); ctx.lineTo(W-MARGIN,H*.5); ctx.stroke(); ctx.setLineDash([]);

    // Tiempo actual
    ctx.font='bold 12px Space Mono,monospace'; ctx.fillStyle=C.tx2; ctx.textAlign='left';
    ctx.fillText(`t = ${st.t.toFixed(2)} s`, MARGIN, 18);
    if(st.modoCaida){ctx.font='10px Syne,sans-serif';ctx.fillStyle='#f85149';ctx.fillText('MRUA: ↓ CAÍDA LIBRE  g = 9.8 m/s²',MARGIN,32);}
  }

  function drawGraph(canvas,ctx,series,tMax,labelY){
    const W=canvas.width,H=canvas.height,PAD={top:18,right:14,bottom:28,left:44};
    const gW=W-PAD.left-PAD.right,gH=H-PAD.top-PAD.bottom;
    ctx.fillStyle=C.panel; ctx.fillRect(0,0,W,H);
    const allVals=series.flatMap(s=>s.hist.map(p=>p.v));
    if(allVals.length<2) return;
    const yMin=Math.min(...allVals,0),yMax=Math.max(...allVals,0);
    const yPad=Math.max((yMax-yMin)*.15,2),yLo=yMin-yPad,yHi=yMax+yPad;
    const toX=t=>PAD.left+(t/tMax)*gW, toY=v=>PAD.top+(1-(v-yLo)/(yHi-yLo))*gH;
    ctx.strokeStyle=C.grid; ctx.lineWidth=.5;
    for(let t=0;t<=tMax;t++){const px=toX(t);ctx.beginPath();ctx.moveTo(px,PAD.top);ctx.lineTo(px,PAD.top+gH);ctx.stroke();}
    for(let i=0;i<=4;i++){const py=PAD.top+i/4*gH;ctx.beginPath();ctx.moveTo(PAD.left,py);ctx.lineTo(PAD.left+gW,py);ctx.stroke();}
    const zy=toY(0);
    if(zy>=PAD.top&&zy<=PAD.top+gH){ctx.strokeStyle=C.zero;ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(PAD.left,zy);ctx.lineTo(PAD.left+gW,zy);ctx.stroke();ctx.setLineDash([]);}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PAD.left,PAD.top);ctx.lineTo(PAD.left,PAD.top+gH);ctx.lineTo(PAD.left+gW,PAD.top+gH);ctx.stroke();
    ctx.font='8px Space Mono,monospace';ctx.fillStyle=C.tx3;ctx.textAlign='right';
    for(let i=0;i<=4;i++) ctx.fillText(Engine.fmt(yLo+i/4*(yHi-yLo)),PAD.left-4,PAD.top+(1-i/4)*gH+3);
    ctx.textAlign='center';
    for(let t=0;t<=tMax;t+=2) ctx.fillText(t+'s',toX(t),PAD.top+gH+14);
    ctx.save();ctx.translate(10,PAD.top+gH/2);ctx.rotate(-Math.PI/2);ctx.fillStyle=C.tx2;ctx.font='bold 9px Syne,sans-serif';ctx.textAlign='center';ctx.fillText(labelY,0,0);ctx.restore();
    series.forEach(s=>{
      if(s.hist.length<2) return;
      ctx.beginPath();ctx.moveTo(toX(s.hist[0].t),toY(0));s.hist.forEach(p=>ctx.lineTo(toX(p.t),toY(p.v)));ctx.lineTo(toX(s.hist[s.hist.length-1].t),toY(0));ctx.closePath();ctx.fillStyle=s.color+'15';ctx.fill();
      ctx.beginPath();s.hist.forEach((p,i)=>i===0?ctx.moveTo(toX(p.t),toY(p.v)):ctx.lineTo(toX(p.t),toY(p.v)));ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
      const last=s.hist[s.hist.length-1];ctx.beginPath();ctx.arc(toX(last.t),toY(last.v),4,0,Math.PI*2);ctx.fillStyle=s.color;ctx.fill();ctx.strokeStyle=C.panel;ctx.lineWidth=2;ctx.stroke();
    });
    if(series[0].hist.length>0){const last=series[0].hist[series[0].hist.length-1];ctx.strokeStyle=C.tCursor;ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(toX(last.t),PAD.top);ctx.lineTo(toX(last.t),PAD.top+gH);ctx.stroke();ctx.setLineDash([]);}
    series.forEach((s,i)=>{const lx=PAD.left+8+i*70,ly=PAD.top+10;ctx.fillStyle=s.color;ctx.fillRect(lx,ly-5,14,3);ctx.font='8px Syne,sans-serif';ctx.textAlign='left';ctx.fillText(s.label,lx+18,ly);});
  }

  function syncTimeline(st){
    const tl=document.getElementById('timeline'), t=Math.min(st.t,st.tMax);
    if(tl&&!tl._dragging){tl.value=t.toFixed(2);if(Math.abs(parseFloat(tl.max)-st.tMax)>.01)tl.max=st.tMax.toFixed(2);}
    const tlTime=document.getElementById('tl-time'); if(tlTime) tlTime.textContent=t.toFixed(2);
    if(st.ended){const btn=document.getElementById('btn-tl-play');if(btn&&btn.textContent==='⏸')btn.textContent='▶';}
  }

  function frame(){
    const st=Engine.getState(); Engine.step(clock.tick());
    drawMain(st);
    drawGraph(cX,ctxX,[{hist:st.mru.histX.map(p=>({t:p.t,v:p.x})),color:C.lineX_mru,label:'MRU'},{hist:st.mrua.histX.map(p=>({t:p.t,v:p.x})),color:C.lineX_mrua,label:'MRUA'}],st.tMax,'x (m)');
    drawGraph(cV,ctxV,[{hist:st.mru.histV,color:C.lineV_mru,label:'MRU'},{hist:st.mrua.histV,color:C.lineV_mrua,label:'MRUA'}],st.tMax,'v (m/s)');
    updatePanel(Engine.getSustitucion()); syncTimeline(st);
    animId=requestAnimationFrame(frame);
  }
  function start(){clock.reset();if(animId)cancelAnimationFrame(animId);animId=requestAnimationFrame(frame);}
  function stop(){if(animId){cancelAnimationFrame(animId);animId=null;}}
  return{init,start,stop,resize};
})();
