// Dos paredes anulares y una huella cilíndrica; eje común, densidad uniforme.
const Engine=(()=>{
 const defaults={tp:0.00635,w:0.2,R_h:0.33,R_ext:0.305,R_int:0.165,rho:1100,omega:8};
 function calculate(p){
  for(const k of Object.keys(defaults))if(typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new RangeError('Todos los parámetros deben ser números finitos.');
  const {tp,w,R_h,R_ext,R_int,rho,omega}=p;
  if(tp<=0||w<=0||R_int<0||R_ext<=R_int||R_h<=R_ext||2*tp>w||rho<=0)throw new RangeError('Se requiere 0 ≤ Ri < Re < Rh, 0 < 2tp ≤ w y densidad positiva.');
  const M_1pared=rho*Math.PI*(R_ext-R_int)*(R_ext+R_int)*tp;
  const I_1pared=M_1pared*(R_ext**2+R_int**2)/2;
  const V_h=Math.PI*(R_h-R_ext)*(R_h+R_ext)*w,M_h=rho*V_h,I_h=M_h*(R_h**2+R_ext**2)/2;
  const M_total=2*M_1pared+M_h,I_total=2*I_1pared+I_h,K=I_total*omega**2/2;
  const r={M_1pared,I_1pared,M_paredes:2*M_1pared,I_paredes:2*I_1pared,V_h,M_h,I_h,M_total,I_total,K,tn:R_h-R_ext};
  if(Object.values(r).some(v=>!Number.isFinite(v))||M_total<=0||I_total<=0)throw new RangeError('Geometría o masa fuera del rango numérico.');
  return r;
 }
 let p={...defaults},t=0,paused=true;const tMax=20;
 function getState(){return {...p,t,tMax,paused,ended:t===tMax,theta:p.omega*t,I:calculate(p).I_total};}
 function set(key,value){if(!(key in defaults))throw new RangeError('Parámetro desconocido.');const next={...p,[key]:value};calculate(next);p=next;t=0;paused=true;}
 function seekTo(value){if(!Number.isFinite(value))throw new RangeError('Tiempo inválido.');t=SimCommon.time(value,tMax);}
 function step(dt){if(!Number.isFinite(dt)||dt<0)throw new RangeError('Intervalo inválido.');if(!paused)seekTo(t+dt);}
 return {calculate,getState,getCalc:()=>calculate(p),set,seekTo,step,pause:()=>{paused=true;},resume:()=>{paused=false;}};
})();
