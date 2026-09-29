const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('js/sim-common.js','utf8'),ctx);const e=vm.runInContext(fs.readFileSync('simuladores/13_llanta/js/engine.js','utf8')+';Engine',ctx);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const p={tp:.5,w:2,R_h:3,R_ext:2,R_int:1,rho:4,omega:2};const c=e.calculate(p);
// Independent exact integration: two walls I=30π, tread I=260π, total 290π.
near(c.M_total,52*Math.PI);near(c.I_total,290*Math.PI);near(c.K,580*Math.PI);
// Independent midpoint integration of r² dm, without engine component formulas.
let integral=0;for(const [a,b,L]of [[1,2,1],[2,3,2]]){const dr=(b-a)/100000;for(let i=0;i<100000;i++){const r=a+(i+.5)*dr;integral+=r*r*4*2*Math.PI*r*L*dr;}}near(c.I_total,integral);
near(e.calculate({...p,omega:0}).K,0);near(e.calculate({...p,omega:-2}).K,c.K);near(e.calculate({...p,R_int:0}).I_total,292*Math.PI);
for(const key of Object.keys(p))for(const v of [NaN,Infinity,-Infinity,'1',null])assert.throws(()=>e.calculate({...p,[key]:v}));
for(const key of ['tp','w','R_h','R_ext','rho'])for(const v of [0,-1])assert.throws(()=>e.calculate({...p,[key]:v}));
assert.throws(()=>e.calculate({...p,R_int:-1}));assert.throws(()=>e.calculate({...p,R_int:2}));assert.throws(()=>e.calculate({...p,tp:2}));assert.throws(()=>e.calculate({...p,rho:1e308}));
const old=e.getState();assert.throws(()=>e.set('rho',0));assert.deepEqual(e.getState(),old);
for(const hz of [30,60,120]){e.seekTo(0);e.resume();for(let i=0;i<hz;i++)e.step(1/hz);near(e.getState().theta,8);e.seekTo(17);near(e.getState().theta,136);e.seekTo(3);near(e.getState().theta,24);}
console.log('PASS: sim13 analytical integration, geometry, zero/signed omega, invalid mass/dimensions, atomic updates, clock and seek.');
