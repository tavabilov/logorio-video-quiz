'use strict';
window.sendLogorioToGoogle=async function(payload){
 const config=window.LOGORIO_STATIC,endpoint=config?.receiver;
 if(!endpoint||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('Приём ответов ещё не подключён. Заполненные ответы сохранены на этом устройстве.');
 if(!window.logorioBridgePromise){window.logorioBridgePromise=new Promise((resolve,reject)=>{
  const channel=crypto.randomUUID(),frame=document.createElement('iframe');frame.hidden=true;frame.title='Защищённая отправка ответов';frame.referrerPolicy='no-referrer';
  const timeout=setTimeout(()=>{window.removeEventListener('message',ready);frame.remove();window.logorioBridgePromise=null;reject(Error('Не удалось подключиться к приёму ответов. Попробуйте ещё раз.'))},30000);
  function ready(event){const allowed=event.origin==='https://script.google.com'||event.origin==='https://script.googleusercontent.com'||/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin);if(!allowed||!event.data||event.data.channel!==channel||event.data.type!=='logorio:ready')return;try{if(event.source.top!==window)return}catch{return}clearTimeout(timeout);window.removeEventListener('message',ready);resolve({channel,source:event.source,origin:event.origin,frame})}
  window.addEventListener('message',ready);frame.src=endpoint+'?channel='+encodeURIComponent(channel);document.body.append(frame);
 })}
 const bridge=await window.logorioBridgePromise;
 return new Promise((resolve,reject)=>{const requestId=crypto.randomUUID();const timeout=setTimeout(()=>{window.removeEventListener('message',receipt);bridge.frame.remove();window.logorioBridgePromise=null;reject(Error('Нет подтверждения сохранения. Попробуйте ещё раз — повтор не создаст дубль.'))},45000);
  function receipt(event){const m=event.data;if(event.source!==bridge.source||event.origin!==bridge.origin||!m||m.channel!==bridge.channel||m.requestId!==requestId)return;if(!['logorio:receipt','logorio:error'].includes(m.type))return;clearTimeout(timeout);window.removeEventListener('message',receipt);if(m.type==='logorio:error')reject(Error(m.error||'Не удалось сохранить ответы.'));else if(typeof m.number==='string'&&typeof m.id==='string')resolve({number:m.number,id:m.id});else reject(Error('Сервис не подтвердил запись ответов.'))}
  window.addEventListener('message',receipt);bridge.source.postMessage({type:'logorio:submit',channel:bridge.channel,requestId,payload},bridge.origin);
 })
};
