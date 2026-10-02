const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// DOM contract test: malicious names/results must only enter inert text nodes.
class Element{constructor(tag='div'){this.tag=tag;this.children=[];this.events={};this._t='';this.value='';}get textContent(){return this._t||this.children.map(c=>typeof c==='string'?c:c.textContent).join(' ');}set textContent(v){this._t=String(v);}append(...nodes){this.children.push(...nodes);if(this.tag==='select'&&!this.value&&nodes[0])this.value=nodes[0].value;}replaceChildren(...nodes){this.children=[...nodes];this._t='';}addEventListener(name,fn){this.events[name]=fn;}set innerHTML(v){throw Error('Unsafe HTML sink');}}
const ids={};const get=id=>ids[id]??=new Element(['sim','record'].includes(id)?'select':'div');
const attack='<img src=x onerror=alert(1)>',doc={getElementById:get,createElement:tag=>new Element(tag)};
let clipboardWritten='';
const ctx=vm.createContext({URL,URLSearchParams,location:{search:'',href:'http://localhost/modules/groups/'},navigator:{clipboard:{writeText:async t=>{clipboardWritten=t;}}},document:doc,window:{localStorage:{getItem:()=>null}},fetch:async url=>({ok:true,json:async()=>url.includes('action=session')?{csrf:'token',user:{name:attack}}:url.includes('action=groups')?{groups:[{id:'1',nombre:attack}]}:{group:{nombre:attack,codigo:'fake'},members:[{nombre:attack}],simulations:[{simulador_id:'13',guardado_en:'2026-10-02 15:07:06',parametros:JSON.stringify({name:attack,valores:[1,2,3],objeto:{x:1}}),resultado:'{"I":1.28}'}]}})});
vm.runInContext(fs.readFileSync('js/sim-registry.js','utf8'),ctx);vm.runInContext(fs.readFileSync('modules/groups/app.js','utf8'),ctx);
(async()=>{
 await new Promise(setImmediate);
 assert.equal(get('welcome').textContent,'Sesión de '+attack);
 const button=get('groups').children[0].children[0];
 assert.equal(button.textContent,attack);
 await button.events.click();
 assert.equal(get('group-title').textContent,attack);
 assert.equal(get('members').children[0].textContent,attack);
 assert.equal(get('code').textContent,'fake');
 await get('copy-code').events.click();
 assert.equal(clipboardWritten,'fake');

 const card=get('saved').children[0];
 // Human-readable simulator name & date assertions
 assert.ok(card.textContent.includes('Momento de inercia compuesto · SIM 13'),'Contains human simulator name');
 assert.ok(card.textContent.includes('2 oct. 2026 · 3:07 p. m.'),'Contains formatted Spanish date');
 // Structured safe render of array and object
 assert.ok(card.children[1].textContent.includes('1, 2, 3'),'Array formatted safely');
 assert.ok(card.children[1].textContent.includes('x: 1'),'Object formatted safely');
 assert.ok(card.children[1].textContent.includes(attack),'XSS attack string rendered as inert text');

 console.log('PASS: group names, members, code copy, human simulator names, friendly dates and snapshot XSS rendered only as inert text.');
})().catch(e=>{console.error(e);process.exitCode=1;});
