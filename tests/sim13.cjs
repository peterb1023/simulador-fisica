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
// Nominal independently expanded in SI, separate from component implementation.
const nominal={tp:.00635,w:.2,R_h:.33,R_ext:.305,R_int:.165,rho:1100,omega:8},n=e.calculate(nominal);
near(n.M_paredes,2*1100*Math.PI*(.305**2-.165**2)*.00635);near(n.I_paredes,1100*Math.PI*.00635*(.305**4-.165**4));
near(n.M_h,1100*Math.PI*(.33**2-.305**2)*.2);near(n.I_h,1100*Math.PI*.2*(.33**4-.305**4)/2);near(n.K,n.I_total*32);
// With 2tp=w, Ri=0 the parts partition an exact solid cylinder.
const disk=e.calculate({...p,tp:1,R_int:0});near(disk.I_total,disk.M_total*3**2/2);
const thin=e.calculate({...p,tp:1,R_int:3-2e-6,R_ext:3-1e-6});assert.ok(Math.abs(thin.I_total/thin.M_total-9)<.00002);
assert.ok(e.calculate({...p,R_int:2-1e-9}).M_paredes<1e-6);assert.ok(e.calculate({...p,R_ext:3-1e-9}).M_h<1e-6);
assert.throws(()=>e.calculate({...p,R_ext:3}));assert.throws(()=>e.calculate({...p,R_ext:4}));
assert.equal(e.step,undefined);assert.equal(e.seekTo,undefined);assert.ok(!fs.readFileSync('simuladores/13_llanta/index.php','utf8').includes('data-timeline'));
console.log('PASS: static sim13 nominal, independent integral, solid cylinder, thin ring, vanishing components, invalid geometry/density/finite limits.');console.log(JSON.stringify(n));
