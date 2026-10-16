// Shared deterministic rules; no storage, network or UI dependencies.
export function selectedValue(raw){return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw.values??raw.value:raw;}
export function isQuestionVisible(q,answers={}){return !q.showWhen||q.showWhen.values.includes(selectedValue(answers[q.showWhen.questionId]));}
export function needsFollowup(q,raw){return !!q.followup?.when.includes(selectedValue(raw));}
const empty=v=>v===undefined||v===null||typeof v==='string'&&!v.trim()||Array.isArray(v)&&!v.length;
export function questionIssue(q,raw,answers={}){
 if(!isQuestionVisible(q,answers))return '';
 if(q.type==='compound'){
  if(empty(raw))return q.required?'Пожалуйста, заполните этот вопрос.':'';
  if(typeof raw!=='object'||Array.isArray(raw)||!raw.fields||typeof raw.fields!=='object'||Array.isArray(raw.fields)||Object.keys(raw).some(k=>k!=='fields')||Object.keys(raw.fields).some(k=>!q.parts.some(p=>p.id===k)))return 'Некорректные поля ответа.';
  const any=q.parts.some(p=>!empty(raw.fields[p.id]));
  for(const part of q.parts){const v=raw.fields[part.id];if((q.required||any)&&empty(v))return 'Укажите: '+part.label+'. Если не знаете, так и напишите.';if(v!==undefined&&(typeof v!=='string'||v.length>(q.maxLength||200)))return 'Проверьте поле: '+part.label+'.';}return '';
 }
 const v=selectedValue(raw);
 if(empty(v))return q.required?'Пожалуйста, ответьте на этот вопрос.':'';
 if(q.type==='multiple'){if(!Array.isArray(v)||v.some(x=>typeof x!=='string'||!q.options.includes(x)&&!(q.allowOther&&x==='__other__')))return 'Выберите варианты из списка.';}
 else if(typeof v!=='string'||v.length>(q.maxLength||(q.type==='short'?500:4000)))return 'Проверьте ответ и его длину.';
 if(q.type==='single'&&!q.options.includes(v)&&!(q.allowOther&&v==='__other__'))return 'Выберите вариант из списка.';
 if(q.allowOther&&raw?.other!==undefined&&(typeof raw.other!=='string'||raw.other.length>(q.maxLength||1000)))return 'Проверьте другой ответ и его длину.';
 if((v==='__other__'||Array.isArray(v)&&v.includes('__other__'))&&!raw?.other?.trim())return 'Напишите свой вариант ответа.';
 if(q.followup){
  if(raw&&typeof raw==='object'&&(Array.isArray(raw)||Object.keys(raw).some(k=>!['value','detail'].includes(k))))return 'Некорректное уточнение.';
  if(needsFollowup(q,raw)&&raw?.detail!==undefined&&(typeof raw.detail!=='string'||raw.detail.length>q.followup.maxLength))return 'Слишком длинное уточнение.';
  if(needsFollowup(q,raw)&&q.followup.required&&!raw?.detail?.trim())return 'Пожалуйста, заполните уточнение.';
 }
 return '';
}
export function normalizeQuestionAnswer(q,raw,answers={}){
 if(!isQuestionVisible(q,answers))return '';
 const issue=questionIssue(q,raw,answers);if(issue)throw Error(issue+' '+q.text);
 if(q.type==='compound')return{fields:Object.fromEntries(q.parts.map(p=>[p.id,typeof raw?.fields?.[p.id]==='string'?raw.fields[p.id].trim():'']))};
 const v=selectedValue(raw);if(empty(v))return q.type==='multiple'?[]:'';
 if(q.followup)return{value:v.trim(),detail:needsFollowup(q,raw)&&typeof raw?.detail==='string'?raw.detail.trim():''};
 if(q.allowOther&&raw?.other){const other=raw.other.trim();return Array.isArray(v)?v.map(x=>x==='__other__'?other:x):v==='__other__'?other:v.trim();}
 return Array.isArray(v)?[...new Set(v.map(x=>x.trim()))]:v.trim();
}
export function formatQuestionAnswer(q,raw){
 if(q?.type==='compound')return q.parts.map(p=>p.label+': '+(raw?.fields?.[p.id]||'Без ответа')).join('\n');
 if(q?.followup){const v=selectedValue(raw);return v?(v+(needsFollowup(q,raw)&&raw?.detail?'\n'+q.followup.label+' '+raw.detail:'')):'Без ответа';}
 if(empty(raw))return 'Без ответа';if(Array.isArray(raw))return raw.join(', ');
 if(raw&&typeof raw==='object'){const v=raw.values||[raw.value];return v.map(x=>x==='__other__'?raw.other:x).filter(Boolean).join(', ')||'Без ответа';}return String(raw);
}
