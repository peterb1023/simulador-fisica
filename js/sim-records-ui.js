// Adaptadores de captura: exclusivamente parámetros y resultados, nunca trails/históricos.
(() => {
  const scalar=v=>typeof v==='number'&&!Number.isFinite(v)?'No finito / no definido':v;
  const pick=(state,names)=>Object.fromEntries(Object.entries(names).map(([key,label])=>[label,scalar(state[key]??null)]));
  function capture(id){
    if(id==='03'){
      const pref=document.getElementById('panel-prefijos').style.display!=='none';
      if(pref){const value=Number(document.getElementById('pref-valor').value),from=Number(document.getElementById('pref-origen').value),to=Number(document.getElementById('pref-destino').value);
        if(document.getElementById('pref-valor').value==='')throw Error('Introduce el valor a convertir.');
        const r=Engine.convertirPrefijo(value,from,to);if(!r)throw Error('Conversión inválida.');
        return {parameters:{modo:'Prefijos SI',valor:value,exponenteOrigen:from,exponenteDestino:to},results:{resultado:r.resultado}};}
      const input=document.getElementById('inp-valor');const cat=[...document.querySelectorAll('.cat-tab')].findIndex(b=>b.classList.contains('active'));
      const category=Engine.CATEGORIAS[cat]?.nombre,from=document.getElementById('sel-origen').value,to=document.getElementById('sel-destino').value;
      const r=Engine.convertir(input.value,category,from,to);if(!r)throw Error('Conversión inválida.');
      return {parameters:{categoría:category,valor:Number(input.value),origen:from,destino:to},results:{['Resultado ('+to+')']:r.resultado}};
    }
    if(id==='13')return {parameters:pick(Engine.getState(),{R_h:'Rh (m)',R_ext:'Re (m)',R_int:'Ri (m)',tp:'tp (m)',w:'w (m)',rho:'ρ (kg/m³)',omega:'ω (rad/s)'}),results:pick(Engine.getCalc(),{M_total:'M (kg)',I_total:'I (kg·m²)',K:'K (J)'})};
    if(id==='02'){
      const params=Object.fromEntries(Engine.getVectors().map((v,i)=>['Vector '+(i+1)+' (u)',`(${v.vx}, ${v.vy})`]));
      const r=Engine.getResultant(),products=Engine.products();
      return {parameters:params,results:{...pick(r,{Rx:'Rx (u)',Ry:'Ry (u)',R:'|R| (u)',thetaR:'θ (°)'}),...(products?{'A·B (u²)':products.dot,'(A×B)z (u²)':products.crossZ}:{})}};
    }
    const s=Engine.getState();
    const adapters={
      '01':[{masa:'m (kg)',g:'g (m/s²)',h0:'h₀ (m)',friction:'Fricción viscosa'},{t:'t (s)',Ep:'Ep (J)',Ec:'Ec (J)',Eth:'Calor (J)',Et:'E total (J)'}],
      '04':[{x0:'x₀ (m)',v0:'v₀ (m/s)',a:'a configurada (m/s²)',modoCaida:'Caída libre',tMax:'Duración (s)'},{t:'t (s)',x:'x (m)',v:'v (m/s)'}],
      '06':[{v0:'v₀ (m/s)',alpha:'θ (°)',y0:'y₀ (m)'},{t:'t (s)',x:'x (m)',y:'y (m)',vx:'vx (m/s)',vy:'vy (m/s)',tMax:'Vuelo (s)',xMax:'Alcance (m)',yMax:'Altura máxima (m)'}],
      '07':[{R:'R (m)',v0:'v₀ tangencial (m/s)',atan:'a tangencial (m/s²)'},{t:'t (s)',theta:'θ (rad)',v:'v tangencial (m/s)',omega:'ω (rad/s)',arad:'a radial (m/s²)',T:'T instantáneo (s)'}],
      '08':[{m:'m (kg)',F:'F (N)',phi:'φ (°)',theta:'θ plano (°)',mus:'μs',muk:'μk',v0:'v₀ (m/s)',modo:'Escenario'},{t:'t (s)',x:'x (m)',vx:'v (m/s)',n:'N (N)',fricSigned:'Fricción (N)',regime:'Régimen',ax:'ax (m/s²)',ay:'ay (m/s²)',sumFx:'ΣFx (N)',sumFy:'ΣFy (N)'}],
      '09':[{modo:'Modo',F:'F (N)',phi:'φ (°)',s:'s (m)',m:'m (kg)',v0:'v₀ (m/s)',k:'k (N/m)',x:'Elongación (m)'},{t:'t presentación (s)',sActual:'Desplazamiento mostrado (m)'}],
      '10':[{modo:'Modo',W:'Trabajo (J)',P:'Potencia (W)',t:'Tiempo (s)',F:'Fuerza (N)',v:'Velocidad (m/s)'},{}],
      '11':[{R:'R (m)',w0:'ω₀ (rad/s)',alpha:'α (rad/s²)'},{t:'t (s)',theta:'θ (rad)',omega:'ω (rad/s)',v_tan:'v (m/s)',a_tan:'a tangencial (m/s²)',a_rad:'a radial (m/s²)'}],
      '12':[{cuerpoId:'Cuerpo',M:'M (kg)',dim:'Dimensión L/R (m)',omega:'ω (rad/s)',d:'d desde CM (m)'},{I:'I (kg·m²)',I_P:'Ip (kg·m²)',K:'K (J)',K_P:'Kp (J)'}]
    };
    if(id==='05')return {parameters:{...pick(s.mru,{x0:'MRU x₀ (m)',v:'MRU v (m/s)'}),...pick(s.mrua,{x0:'MRUA x₀ (m)',v0:'MRUA v₀ (m/s)',a:'MRUA a (m/s²)'}),'Caída libre':s.modoCaida,'Duración (s)':s.tMax},results:{'t (s)':s.t,'MRU x (m)':s.mru.x,'MRUA x (m)':s.mrua.x,'MRUA v (m/s)':s.mrua.v}};
    if(!adapters[id])throw Error('Simulador sin adaptador.');
    const snapshot={parameters:pick(s,adapters[id][0]),results:pick(s,adapters[id][1])};
    if(id==='01'){snapshot.results['v (m/s)']=Engine.getVelocity();snapshot.results['h (m)']=Engine.trackHeight(s.pos,s.h0);}
    if(id==='04')snapshot.results['a efectiva (m/s²)']=s.modoCaida?Engine.G:s.a;
    if(id==='09')Object.assign(snapshot.results,pick(s.calc,{W:s.modo==='resorte'?'W externo = ΔU (J)':'Trabajo (J)',K1:'K inicial (J)',K2:'K final (J)',v2:'v final (m/s)'}));
    if(id==='10'){
      if(s.resultado===null||!Number.isFinite(s.resultado))throw Error(s.error||'Resultado inválido.');
      snapshot.results['Resultado ('+({P:'W',Fv:'W',W:'J',t:'s'}[s.modo])+')']=s.resultado;
      const input=document.getElementById('eff-in'),output=document.getElementById('eff-out'),kind=document.getElementById('eff-kind');
      const eta=Engine.efficiency(parseFloat(output.value),parseFloat(input.value));
      if(eta!==null){snapshot.parameters['Entrada eficiencia ('+kind.value+')']=+input.value;snapshot.parameters['Salida útil ('+kind.value+')']=+output.value;snapshot.results['Eficiencia (%)']=eta*100;}
    }
    return snapshot;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const id=document.body.dataset.simId,nav=document.querySelector('.sim-nav');if(!nav||!id)return;
    let storage;try{storage=window.localStorage;}catch{}
    const store=SimRegistry.create(id,storage);
    if(typeof SimGroups!=='undefined')SimGroups.bind(()=>capture(id),id);
    const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
    const tab=make('section',null,'tab registry-panel');tab.id='tab-registros';tab.style.display='none';
    const title=make('h2','Registros locales');tab.append(title,make('p','Capturas manuales de parámetros y resultados. Máximo 100; al superar el límite se retira el más antiguo. No son el historial temporal de la gráfica ni se envían al servidor.'));
    const actions=make('div',null,'registry-actions'),save=make('button','Guardar registro','nav-btn'),clear=make('button','Limpiar registros','nav-btn');
    save.type=clear.type='button';actions.append(save,clear);tab.append(actions);
    const status=make('p');status.setAttribute('role','status');tab.append(status);
    const wrap=make('div',null,'registry-scroll');wrap.tabIndex=0;wrap.setAttribute('aria-label','Tabla de registros; desplazamiento horizontal');
    const table=make('table'),caption=make('caption','Capturas del simulador '+id),thead=make('thead');
    const tbody=make('tbody');table.append(caption,thead,tbody);wrap.append(table);tab.append(wrap);
    document.getElementById('tab-sim').parentElement.append(tab);
    const open=make('button','Registros','nav-btn nav-btn-records'),quick=make('button','Guardar registro','nav-btn nav-btn-record');open.type=quick.type='button';nav.append(quick,open);
    const listFields=fields=>{const dl=make('dl');for(const [key,value]of Object.entries(fields)){dl.append(make('dt',key),make('dd',value===null?'No definido / no alcanzable':typeof value==='number'?String(Math.round(value*1e6)/1e6):String(value)));}return dl;};
    function render(){const records=store.list();open.textContent=`Registros (${records.length})`;open.setAttribute('aria-label',open.textContent);tbody.replaceChildren();clear.disabled=!records.length;
      // Union of snapshot fields preserves comparisons across modes. Cap visible columns.
      const columns={};for(const field of ['parameters','results']){const keys=[...new Set(records.flatMap(r=>Object.keys(r.snapshot[field])))];columns[field]={shown:keys.slice(0,32),extra:keys.length>32};}
      thead.replaceChildren();const groups=make('tr'),labels=make('tr');
      for(const text of ['#','Fecha']){const th=make('th',text);th.scope='col';th.rowSpan=2;groups.append(th);}
      for(const [field,name]of [['parameters','Parámetros'],['results','Resultados']]){
        const keys=columns[field].shown,group=make('th',name);group.scope='colgroup';group.colSpan=Math.max(1,keys.length+Number(columns[field].extra));group.id='registry-'+field;groups.append(group);
        for(const [i,key]of (keys.length?keys:['Sin datos']).entries()){const th=make('th',key);th.scope='col';th.id='registry-'+field+'-'+i;labels.append(th);}
        if(columns[field].extra){const th=make('th','Otros campos');th.scope='col';labels.append(th);}
      }
      const actionHeader=make('th','Acciones');actionHeader.scope='col';actionHeader.rowSpan=2;groups.append(actionHeader);thead.append(groups,labels);
      for(const r of records){const tr=make('tr');tr.append(make('td',String(r.id)),make('td',new Date(r.savedAt).toLocaleString('es')));
        for(const field of ['parameters','results']){
          const keys=columns[field].shown;
          for(const [i,key]of (keys.length?keys:['Sin datos']).entries()){const value=r.snapshot[field][key],td=make('td',value===undefined?'—':value===null?'No definido':String(value));td.setAttribute('headers','registry-'+field+' registry-'+field+'-'+i);tr.append(td);}
          if(columns[field].extra){const td=make('td');td.append(listFields(Object.fromEntries(Object.entries(r.snapshot[field]).filter(([key])=>!keys.includes(key)))));tr.append(td);}
        }
        const td=make('td'),remove=make('button','Eliminar');remove.type='button';remove.setAttribute('aria-label','Eliminar registro '+r.id);remove.addEventListener('click',()=>{store.remove(r.id);render();});td.append(remove);tr.append(td);tbody.append(tr);}
      status.textContent=store.notice()||(records.length?'Registros guardados en este navegador.':'Sin registros guardados.');
    }
    function saveCurrent(){try{const id=store.save(capture(document.body.dataset.simId));render();status.textContent=`Registro ${id} guardado. ${store.notice()}`;quick.textContent='✓ Guardado';setTimeout(()=>{quick.textContent='Guardar registro';},1000);}catch(e){status.textContent=e.message;setTab('registros',open);}}
    save.addEventListener('click',saveCurrent);quick.addEventListener('click',saveCurrent);
    clear.addEventListener('click',()=>{store.clear();render();});open.addEventListener('click',()=>{setTab('registros',open);render();});render();
  });
})();
