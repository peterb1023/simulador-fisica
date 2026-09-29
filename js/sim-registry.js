// Capturas discretas explícitas. No observa frames, parámetros ni seek.
const SimRegistry = (() => {
  const LIMIT=100, MAX_RECORD=32768, MAX_STORAGE=3500000;
  const clone=value=>JSON.parse(JSON.stringify(value));
  function fields(value){
    return value && !Array.isArray(value) && typeof value==='object' && Object.keys(value).length<=1100 &&
      Object.entries(value).every(([k,v])=>k.length<=100 && !['__proto__','constructor','prototype'].includes(k) &&
        (v===null || typeof v==='boolean' || (typeof v==='number'&&Number.isFinite(v)) || (typeof v==='string'&&v.length<=4096)));
  }
  function validSnapshot(s){return !!s&&fields(s.parameters)&&fields(s.results)&&JSON.stringify(s).length<=MAX_RECORD;}
  function create(sim, storage){
    if(!/^(0[1-9]|1[0-3])$/.test(sim))throw new Error('Simulador inválido.');
    const key='fisica-i:records:v1:sim-'+sim;
    let records=[],notice='';
    try{
      const raw=storage?.getItem(key);
      if(raw){
        if(raw.length>MAX_STORAGE)throw Error('size');
        const parsed=JSON.parse(raw);
        if(parsed.version!==1||!Array.isArray(parsed.records)||parsed.records.length>LIMIT)throw Error('format');
        const ids=new Set();
        if(!parsed.records.every(r=>r&&Number.isSafeInteger(r.id)&&r.id>0&&!ids.has(r.id)&&ids.add(r.id)&&
          typeof r.savedAt==='string'&&r.savedAt.length<40&&Number.isFinite(Date.parse(r.savedAt))&&validSnapshot(r.snapshot)))throw Error('record');
        records=parsed.records;
      }
    }catch{notice='Los registros locales no son válidos o no están disponibles; se inicia una lista vacía.';}
    function persist(){try{if(!storage)throw Error('unavailable');storage.setItem(key,JSON.stringify({version:1,records}));notice='Guardado solo en este navegador.';}catch{notice='Almacenamiento no disponible: registros conservados únicamente durante esta sesión.';}}
    return {key,list:()=>clone(records),notice:()=>notice,
      save(snapshot){if(!validSnapshot(snapshot))throw new Error('Resultado inválido o demasiado grande para guardar.');
        const id=(records.at(-1)?.id||0)+1;if(!Number.isSafeInteger(id))throw new Error('Límite de identificadores alcanzado.');
        records.push({id,savedAt:new Date().toISOString(),snapshot:clone(snapshot)});records=records.slice(-LIMIT);persist();return id;},
      remove(id){records=records.filter(r=>r.id!==id);persist();},
      clear(){records=[];persist();}
    };
  }
  return {create,validSnapshot,LIMIT};
})();
