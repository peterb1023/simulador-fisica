const Render=(()=>{
 let canvas,ctx;
 function draw(){
  const s=Engine.getState(),W=canvas.logicalWidth,H=canvas.logicalHeight;
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#0d1117';ctx.fillRect(0,0,W,H);
  const cx=W*.27,cy=H*.48,scale=Math.min(W*.22,H*.34)/s.R_h;
  const ring=(a,b,color)=>{ctx.beginPath();ctx.arc(cx,cy,a*scale,0,2*Math.PI);ctx.arc(cx,cy,b*scale,0,2*Math.PI,true);ctx.fillStyle=color;ctx.fill('evenodd');};
  ring(s.R_h,s.R_ext,'#3fb950');ring(s.R_ext,s.R_int,'#58a6ff');
  ctx.fillStyle='#e3b341';ctx.beginPath();ctx.arc(cx+(s.R_h+s.R_ext)*scale/2*Math.cos(s.theta),cy-(s.R_h+s.R_ext)*scale/2*Math.sin(s.theta),4,0,Math.PI*2);ctx.fill();
  ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#e6edf3';ctx.fillText('Vista frontal',cx,30);
  const x=W*.56,y=H*.8,q=Math.min(W*.38/s.w,H*.55/s.R_h);
  ctx.fillStyle='#3fb950';ctx.fillRect(x,y-s.R_h*q,s.w*q,(s.R_h-s.R_ext)*q);
  ctx.fillStyle='#58a6ff';for(const z of [0,s.w-s.tp])ctx.fillRect(x+z*q,y-s.R_ext*q,s.tp*q,(s.R_ext-s.R_int)*q);
  ctx.fillStyle='#e6edf3';ctx.fillText('Corte axial superior',W*.75,30);
  ctx.strokeStyle='#8b949e';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+s.w*q+5,y);ctx.stroke();ctx.setLineDash([]);
  ctx.fillText('Eje común',W*.75,y+20);ctx.fillText('Azul: 2 paredes · verde: huella',W/2,H-18);
 }
 function init(c){canvas=c;ctx=c.getContext('2d');const resize=()=>{SimCanvas.resize(canvas);draw();};SimCanvas.observe([canvas],resize);resize();}
 return {init,draw};
})();
