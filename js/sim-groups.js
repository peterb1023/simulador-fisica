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
  submit.textContent='Confirmar guardado';close.textContent='Cancelar';login.textContent='Iniciar sesión / gestionar grupos';login.href=base.href;login.href=new URL('?return='+encodeURIComponent(location.href),base).href;
  dialog.append(title,status,label,preview,submit,close,login);document.body.append(dialog);let snapshot,csrf='',sending=false,closeTimer=null;
  async function request(action,data){const res=await fetch(new URL('api.php?action='+action,base),{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined});const result=await res.json();if(!res.ok)throw Error(result.message);return result;}
  button.addEventListener('click',async()=>{
   if(closeTimer){clearTimeout(closeTimer);closeTimer=null;}
   dialog.showModal();
   sending=false;
   submit.disabled=true;
   submit.textContent='Confirmar guardado';
   select.replaceChildren();
   preview.textContent='';
   status.textContent='Comprobando sesión…';
   status.className='';
   label.hidden=submit.hidden=preview.hidden=true;
   login.textContent='Iniciar sesión';
   try{
    snapshot=JSON.parse(JSON.stringify(capture()));
    const session=await request('session');
    csrf=session.csrf;
    if(!session.user){status.textContent='Debes iniciar sesión para guardar simulaciones en un grupo.';return;}
    login.textContent='Gestionar grupos';
    const data=await request('groups');
    for(const group of data.groups){const option=document.createElement('option');option.value=group.id;option.textContent=group.nombre;select.append(option);}
    label.hidden=submit.hidden=preview.hidden=!data.groups.length;
    preview.textContent=JSON.stringify(snapshot,null,2);
    status.textContent=data.groups.length?'Revisa la captura y confirma su envío.':'Aún no perteneces a ningún grupo.';
    submit.disabled=!data.groups.length;
   }catch(e){status.textContent=e.message;status.className='status-error';}
  });
  submit.addEventListener('click',async()=>{
   if(sending)return;
   sending=true;
   submit.disabled=true;
   submit.textContent='Guardando…';
   status.textContent='Guardando captura en el grupo…';
   status.className='status-loading';
   try{
    const selectedOpt=(select.options?select.options[select.selectedIndex]:select.children?.find?.(c=>String(c.value)===String(select.value)))||select.children?.[0];
    const groupName=selectedOpt?.textContent||'el grupo';
    await request('save',{grupo_id:Number(select.value),simulador_id:id,parametros:snapshot.parameters,resultado:snapshot.results});
    submit.textContent='✓ Guardado';
    status.textContent='✓ Simulación guardada en «'+groupName+'»';
    status.className='status-success';
    closeTimer=setTimeout(()=>{if(dialog.open)dialog.close();},1600);
   }catch(e){
    status.textContent='Error al guardar: '+e.message;
    status.className='status-error';
    submit.disabled=false;
    submit.textContent='Confirmar guardado';
   }finally{
    sending=false;
   }
  });
  close.addEventListener('click',()=>{if(closeTimer){clearTimeout(closeTimer);closeTimer=null;}dialog.close();});
 }
 return {bind};
})();
