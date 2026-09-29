const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const api=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/sim-registry.js'),'utf8')+';SimRegistry');
const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
let r=api.create('01',storage),s={parameters:{'m (kg)':2},results:{'Ep (J)':98}};
r.save(s);s.parameters['m (kg)']=4;assert.equal(r.list()[0].snapshot.parameters['m (kg)'],2);
let copy=r.list();copy[0].snapshot.results['Ep (J)']=0;assert.equal(r.list()[0].snapshot.results['Ep (J)'],98);
assert.equal(api.create('01',storage).list().length,1);assert.equal(api.create('02',storage).list().length,0);
for(let i=0;i<150;i++)r.save(s);assert.equal(r.list().length,100);r.remove(r.list()[0].id);assert.equal(r.list().length,99);r.clear();assert.equal(api.create('01',storage).list().length,0);
for(const corrupt of ['{','null','[]','{"version":1,"records":[{}]}','{"version":1,"records":"bad"}']){data.set(r.key,corrupt);assert.equal(api.create('01',storage).list().length,0);}
assert.throws(()=>r.save({parameters:{bad:NaN},results:{}}));assert.throws(()=>r.save({parameters:{bad:Infinity},results:{}}));assert.throws(()=>r.save({parameters:{bad:'x'.repeat(40000)},results:{}}));
r=api.create('01',{getItem(){throw Error('blocked')},setItem(){throw Error('quota')}});r.save(s);assert.equal(r.list().length,1);assert.match(r.notice(),/sesión/);
// Exact attack string remains inert data; rendering uses textContent, never innerHTML.
r.save({parameters:{name:'<img src=x onerror=alert(1)>'},results:{}});assert.equal(r.list().at(-1).snapshot.parameters.name,'<img src=x onerror=alert(1)>');
assert.ok(!fs.readFileSync(path.join(__dirname,'../js/sim-records-ui.js'),'utf8').includes('innerHTML'));
console.log('PASS: local registry namespace, limits, immutable snapshots, corrupt JSON, storage failure, XSS data.');
