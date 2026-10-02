const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Input{constructor(){this.value='5';this.min='0';this.max='10';this.step='.5';this.events={};this.attrs={};this.parentElement={classList:{add(){}}};}get valueAsNumber(){return this.value===''?NaN:Number(this.value);}get validity(){const v=this.valueAsNumber;return {valid:!this.error&&Number.isFinite(v)&&v>=+this.min&&v<=+this.max&&Math.abs((v-this.min)/this.step-Math.round((v-this.min)/this.step))<1e-8};}setCustomValidity(s){this.error=s;}removeAttribute(k){delete this.attrs[k];}setAttribute(k,v){this.attrs[k]=v;}getAttribute(){return 'Control';}addEventListener(k,v){this.events[k]=v;}after(label,n){this.number=n;}}
const ctx=vm.createContext({document:{body:{dataset:{simId:'06'}},createElement:()=>new Input(),querySelector:()=>null}});const api=vm.runInContext(fs.readFileSync('js/sim-inputs.js','utf8')+';SimInputs',ctx),slider=new Input();slider.id='sl-alpha';let state=5;api.bind(slider,v=>state=v);const n=slider.number;
n.value='7.5';n.events.input();assert.equal(state,7.5);assert.equal(slider.value,'7.5');
for(const bad of ['', 'NaN','Infinity','-1','11','7.3']){n.value=bad;n.events.input();assert.equal(state,7.5);assert.equal(n.attrs['aria-invalid'],'true');n.events.blur();assert.equal(n.value,'7.5');}
slider.value='2';slider.events.input();assert.equal(state,2);assert.equal(n.value,'2');api.sync('sl-alpha',4);assert.equal(n.value,'4');
// Actual renderers at both pixel densities: finite drawing operations, visible text coordinates, unchanged physical state.
for(const sim of ['06_proyectiles','12_inercia'])for(const dpr of [1,2])for(const [W,H]of [[345,790],[508,790],[896,680]]){
 let callback;const texts=[],gradient={addColorStop(){}};const context=new Proxy({measureText:s=>({width:String(s).length*6}),createRadialGradient:()=>gradient,fillText:(t,x,y)=>texts.push({t,x,y})},{get:(o,k)=>k in o?o[k]:(...args)=>{for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v),sim+' finite '+k);}});
 const canvas={getContext:()=>context,getBoundingClientRect:()=>({width:W,height:H}),parentElement:{clientWidth:W,clientHeight:H},closest:()=>({style:{}})};
 const scope=vm.createContext({console,performance:{now:()=>0},window:{devicePixelRatio:dpr,addEventListener(){}},ResizeObserver:class{observe(){}},document:{getElementById:()=>canvas},requestAnimationFrame:fn=>{callback=fn;return 1;},cancelAnimationFrame(){},UI:{updatePanel(){}}});
 for(const f of ['js/sim-common.js','js/canvas-common.js','simuladores/'+sim+'/js/engine.js','simuladores/'+sim+'/js/render.js'])vm.runInContext(fs.readFileSync(f,'utf8'),scope);
 const e=vm.runInContext('Engine',scope),r=vm.runInContext('Renderer',scope);if(e.init)e.init();if(sim.startsWith('06')){e.setAlpha(90);e.setY0(10);}else{e.setM(50);e.setDim(8);e.setOmega(20);e.setD(5);}
 const before=JSON.stringify(e.getState());r.init();r.start();callback();assert.equal(JSON.stringify(e.getState()),before);assert.equal(canvas.width,Math.round(W*dpr));assert.equal(canvas.height,Math.round(H*dpr));
 for(const t of texts)assert.ok(t.x>=0&&t.x<=W&&t.y>=0&&t.y<=H,sim+' label bounds '+JSON.stringify(t));
 if(sim.startsWith('12')){assert.ok(texts.some(x=>x.t==='I'));assert.ok(texts.some(x=>x.t==='K'));}
}
console.log('PASS: paired controls finite/range/step rejection, bidirectional sync, render 06 vertical and 12 large values at responsive sizes, DPR 1/2, unchanged physics.');
