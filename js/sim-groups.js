// Shared explicit-save hook. Snapshots stay local until the confirmation button.
const SimGroups=(()=>{
 const base=new URL('../modules/groups/',document.currentScript.src);
 function bind(capture,id){
  const nav=document.querySelector('.sim-nav'),button=document.createElement('button');button.type='button';button.className='nav-btn';button.textContent='Guardar en grupo';nav.append(button);
  const dialog=document.createElement('dialog');dialog.className='group-dialog';dialog.setAttribute('aria-label','Guardar simulación en grupo');
  const title=document.createElement('h2');title.textContent='Guardar en grupo';
  const status=document.createElement('p');status.setAttribute('role','status');
  const label=document.createElement('label');label.textContent='Grupo de destino';const select=document.createElement('select');label.append(select);
  const preview=document.createElement('pre'),submit=document.createElement('button'),close=document.createElement('button'),login=document.createElement('a');
  submit.textContent='Confirmar guardado';close.textContent='Cancelar';login.textContent='Iniciar sesión / gestionar grupos';login.href=base.href;login.target='_blank';login.rel='noopener';
  dialog.append(title,status,label,preview,submit,close,login);document.body.append(dialog);let snapshot,csrf='';
  async function request(action,data){const res=await fetch(new URL('api.php?action='+action,base),{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined});const result=await res.json();if(!res.ok)throw Error(result.message);return result;}
  button.addEventListener('click',async()=>{dialog.showModal();submit.disabled=true;select.replaceChildren();preview.textContent='';status.textContent='Comprobando sesión…';try{snapshot=JSON.parse(JSON.stringify(capture()));const session=await request('session');csrf=session.csrf;if(!session.user)throw Error('Inicia sesión y vuelve a abrir este diálogo.');const data=await request('groups');for(const group of data.groups){const option=document.createElement('option');option.value=group.id;option.textContent=group.nombre;select.append(option);}preview.textContent=JSON.stringify(snapshot,null,2);status.textContent=data.groups.length?'Revisa la captura y confirma su envío.':'Crea un grupo o únete desde gestión de grupos.';submit.disabled=!data.groups.length;}catch(e){status.textContent=e.message;}});
  submit.addEventListener('click',async()=>{submit.disabled=true;try{await request('save',{grupo_id:Number(select.value),simulador_id:id,parametros:snapshot.parameters,resultado:snapshot.results});status.textContent='Simulación guardada en el grupo.';}catch(e){status.textContent=e.message;submit.disabled=false;}});
  close.addEventListener('click',()=>dialog.close());
 }
 return {bind};
})();
