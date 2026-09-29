const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
function engine(prefix) {
  const dir = fs.readdirSync(path.join(__dirname, '../simuladores')).find(s => s.startsWith(prefix + '_'));
  const ctx = vm.createContext({console});
  const common = path.join(__dirname, '../js/sim-common.js');
  if (fs.existsSync(common)) vm.runInContext(fs.readFileSync(common, 'utf8'), ctx);
  return vm.runInContext(fs.readFileSync(path.join(__dirname, '../simuladores', dir, 'js/engine.js'), 'utf8') + ';Engine', ctx);
}
function near(actual, expected, tol=1e-7) { assert.ok(Number.isFinite(actual) && Math.abs(actual-expected) <= tol, `${actual} != ${expected}`); }
const energy = engine('01');
energy.setMasa(2); energy.setAltura(5); energy.setGravity(9.8);
near(energy.getState().Ep,98);
for (const friction of [false,true]) {
  energy.setFriction(friction);
  for(let i=0;i<600;i++) energy.step(1/60);
  const s=energy.getState();
  near(s.Ep+s.Ec+s.Eth,s.Et,1e-5);
  near(energy.getVelocity(),Math.abs(s.vel)*Math.hypot(5,2*s.h0*s.pos));
  assert.ok(friction ? s.Eth>0 : s.Eth===0);
}
const projectile=engine('06'); projectile.setV0(10); projectile.setAlpha(45); projectile.setY0(0);
near(projectile.getState().tMax,1.4430750636460152); near(projectile.getState().xMax,100/9.8); near(projectile.getState().yMax,25/9.8);
projectile.setY0(5); projectile.step(projectile.getState().tMax); near(projectile.getState().y,0);
projectile.setAlpha(90); assert.equal(projectile.yOfX(0),null);
const work=engine('09'); work.setF(10); work.setS(5); work.setPhi(60); near(work.calcular().W,25);
work.setPhi(90); near(work.calcular().W,0); work.setModo('resorte');work.setK(50);work.setX(2);near(work.calcular().W,100);near(work.calcular().K2,0);
const inertia=engine('12'); inertia.setCuerpo('disco');inertia.setM(2);inertia.setDim(3);inertia.setD(2);near(inertia.getState().I,9);near(inertia.getState().I_P,17);
inertia.setCuerpo('varilla_ext');inertia.setDim(3);inertia.setD(1.5);near(inertia.getState().I_P,inertia.getState().I);


for (const hz of [30,60,120]) {
  const e=engine('04');e.setX0(0);e.setV0(10);e.setA(2);
  for(let i=0;i<hz*3;i++) e.step(1/hz);
  near(e.getState().x,39);near(e.getState().v,16);
}
const clockContext=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/sim-common.js'),'utf8'),clockContext);
vm.runInContext(`let now=0; const clock=SimCommon.createClock(()=>now);
 for(const hz of [30,60,120]) { now=0;clock.reset();let total=0;
 for(let i=0;i<hz;i++){now+=1000/hz;total+=clock.tick();}
 if(Math.abs(total-1)>1e-10)throw Error('clock frequency'); }
 now+=100000;if(clock.tick()!==0.05)throw Error('clock cap');`,clockContext);

for(const id of ['01','04','05','06','07','08','09']){
 const e=engine(id);e.init();const t=Math.min(1,e.getState().tMax/2);
 e.seekTo(t);const before=JSON.stringify(e.getState());e.seekTo(0);e.seekTo(t);assert.equal(JSON.stringify(e.getState()),before,id+' deterministic seek');
 e.seekTo(e.getState().tMax);assert.ok(e.getState().ended,id+' end');
}
const long=engine('04');long.setTMax(1e6);long.seekTo(1e6);assert.ok(long.getState().histX.length<=242);

const vec=engine('02');near(vec.createVector(3,4).r,5);near(vec.createVector(-3,4).theta,126.86989764584402);near(vec.products().dot,7);near(vec.products().crossZ,24);
const newton=engine('08');newton.setM(5);newton.setF(30);near(newton.getState().ax,6);
newton.setMus(0.8);newton.setMuk(0.5);near(newton.getState().ax,0);newton.setF(50);near(newton.getState().ax,5.1);
newton.setF(0);newton.setTheta(30);near(newton.getState().ax,0);newton.setMus(0.4);newton.setMuk(0.2);assert.ok(newton.getState().ax<0);assert.ok(newton.getState().fricSigned>0);
newton.setTheta(0);newton.setV0(4);newton.seekTo(10);near(newton.getState().vx,0);near(newton.getState().x,16/(2*0.2*9.8));
assert.throws(()=>newton.setM(0));assert.throws(()=>newton.setMuk(-1));
const power=engine('10');power.setW(1000);power.setT(5);near(power.getState().resultado,200);near(power.efficiency(800,1000),0.8);assert.equal(power.efficiency(1,0),null);assert.equal(power.efficiency(2,1),null);
for(const hz of [30,60,120]){
 const rotation=engine('11');rotation.setW0(2);rotation.setAlpha(3);for(let i=0;i<hz*4;i++)rotation.step(1/hz);near(rotation.getState().omega,14);near(rotation.getState().theta,32);rotation.step(10);near(rotation.getState().omega,44);
 const circular=engine('07');circular.setR(2);circular.setV0(4);near(circular.getState().omega,2);near(circular.getState().arad,8);near(circular.getState().T,Math.PI);circular.setAtan(-2);for(let i=0;i<hz*4;i++)circular.step(1/hz);near(circular.getState().theta,0);near(circular.getState().v,-4);
}

const units=engine('03');near(units.convertir(1,'Longitud','km','m').resultado,1000);near(units.convertir(32,'Temperatura','°F','°C').resultado,0);near(units.convertir(1,'Potencia','kW','W').resultado,1000);
const mru=engine('05');mru.setMruaX0(0);mru.setMruaV0(10);mru.setMruaA(2);mru.seekTo(3);near(mru.getState().mrua.x,39);near(mru.getState().mrua.v,16);near(mru.getState().mrua.v**2,100+4*mru.getState().mrua.x);
for(const [id,setter] of [['01','setMasa'],['04','setV0'],['05','setMruV'],['06','setV0'],['07','setR'],['08','setM'],['09','setK'],['11','setW0'],['12','setM']]){
 const e=engine(id);for(const v of [NaN,Infinity,-Infinity])assert.throws(()=>e[setter](v),id+' '+v);
}
for(const [id,setter] of [['01','setMasa'],['06','setY0'],['07','setR'],['08','setMuk'],['09','setK'],['12','setM']]) assert.throws(()=>engine(id)[setter](-1),id+' negative');
assert.throws(()=>vec.createVector(NaN,0));assert.throws(()=>vec.setPolar(0,-1,0));
for(const v of [NaN,Infinity,-Infinity]){assert.equal(units.convertir(v,'Longitud','km','m'),null);power.setW(v);assert.equal(power.getState().resultado,null);assert.equal(power.efficiency(v,10),null);}
assert.equal(units.convertir(-1,'Temperatura','K','°C'),null);near(units.convertir(0,'Longitud','m','km').resultado,0);
power.setW(1000);power.setT(0);assert.equal(power.getState().resultado,null);power.setW(-1);assert.equal(power.getState().resultado,null);
for(const angle of [0,90]){projectile.setY0(0);projectile.setAlpha(angle);projectile.setV0(0);projectile.seekTo(0);near(projectile.getState().x,0);near(projectile.getState().y,0);}
work.setModo('fuerza');work.setF(10);work.setS(5);work.setPhi(0);near(work.calcular().W,50);work.setPhi(180);work.setV0(0);assert.equal(work.calcular().v2,null);
newton.setV0(-4);newton.seekTo(10);near(newton.getState().vx,0);assert.ok(newton.getState().x<0);
for(const hz of [30,60,120]){const e=engine('08');for(let i=0;i<hz;i++)e.step(1/hz);near(e.getState().x,3);near(e.getState().vx,6);}
console.log('PASS: 12 simulators, physical cases, invalid inputs, deterministic seek, 30/60/120 Hz.');
