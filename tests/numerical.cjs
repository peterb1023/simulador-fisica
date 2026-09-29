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
console.log('Numerical tests: PASS');

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
