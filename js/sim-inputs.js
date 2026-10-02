// Paired numeric/range controls. Invalid edits never reach a physics setter.
const SimInputs=(()=>{
 const pairs=new Map();
 function bind(slider,apply){
  const number=document.createElement('input');number.type='number';number.id='num-'+slider.id;number.className='precise-input';
  for(const key of ['min','max','step'])number[key]=slider[key];number.value=slider.value;
  const label=document.createElement('label');label.htmlFor=number.id;label.className='sr-only';const names={'sl-M':'Masa (kg)','sl-dim':'Dimensión L/R (m)','sl-d':'Distancia al eje paralelo (m)','sl-omega':'Velocidad angular (rad/s)','sl-w0':'Velocidad angular inicial (rad/s)','sl-R':'Radio (m)','sl-v0':'Velocidad inicial (m/s)','sl-atan':'Aceleración tangencial (m/s²)','sl-alpha':document.body.dataset.simId==='06'?'Ángulo de lanzamiento (°)':'Aceleración angular (rad/s²)','sl-y0':'Altura inicial (m)'};label.textContent=names[slider.id]||slider.id;
  slider.after(label,number);slider.parentElement.classList.add('paired-control');let last=slider.value;
  function sync(value){last=String(value);slider.value=last;number.value=last;number.setCustomValidity('');number.removeAttribute('aria-invalid');}
  slider.addEventListener('input',()=>{const value=Number(slider.value);if(!Number.isFinite(value))return;apply(value);sync(slider.value);});
  number.addEventListener('input',()=>{number.setCustomValidity('');const value=number.valueAsNumber;if(number.value===''||!Number.isFinite(value)||!number.validity.valid){number.setAttribute('aria-invalid','true');number.setCustomValidity('Introduce un valor dentro del rango y paso indicados.');return;}try{apply(value);sync(value);}catch(e){number.setCustomValidity(e.message);number.setAttribute('aria-invalid','true');}});
  number.addEventListener('blur',()=>{if(!number.validity.valid||number.value===''){sync(last);const message=document.querySelector('.validation-message');if(message)message.textContent='';}});pairs.set(slider.id,sync);
 }
 function sync(id,value){pairs.get(id)?.(value);}
 return {bind,sync};
})();
