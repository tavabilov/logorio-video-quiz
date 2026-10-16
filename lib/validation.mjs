import {isQuestionVisible,normalizeQuestionAnswer} from '../public/question-rules.js';
const safeId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
export function validateContent(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) throw Error('Некорректное содержание');
  for (const key of ['title','offer','intro','completionText']) if (typeof c[key] !== 'string' || c[key].length > 10000) throw Error(`Некорректное поле ${key}`);
  if (!Array.isArray(c.blocks) || !c.blocks.length || c.blocks.length > 20) throw Error('Нужно от 1 до 20 блоков');
  if(typeof c.demo !== 'boolean') throw Error('Демонстрационный режим должен быть логическим значением');
  if(c.demo !== true && process.env.ALLOW_PRODUCTION_CONTENT !== 'true') throw Error('Демонстрационный режим обязателен до согласования запуска');
  if(c.introVideo && !/^\/(media|uploads)\/[a-zA-Z0-9._-]+\.mp4$/.test(c.introVideo)) throw Error('Вводное видео должно быть локальным MP4');
  const ids = new Set();
  for (const b of c.blocks) {
    if (!safeId(b.id) || ids.has(b.id)) throw Error('Повторный или пустой ID блока'); ids.add(b.id);
    for(const key of ['title','description','transcript']) if (typeof b[key] !== 'string' || b[key].length > 20000) throw Error(`Некорректное поле блока ${key}`);
    if (typeof b.video !== 'string' || !/^\/(media|uploads)\/[a-zA-Z0-9._-]+\.mp4$/.test(b.video)) throw Error('Видео должно быть локальным MP4');
    if (b.poster && (typeof b.poster !== 'string' || !/^\/[a-zA-Z0-9/._-]+$/.test(b.poster) || b.poster.includes('..'))) throw Error('Некорректная обложка');
    if (!Array.isArray(b.questions) || !b.questions.length || b.questions.length > 30) throw Error('Нужно от 1 до 30 вопросов в блоке');
    for(const q of b.questions) {
      if(!safeId(q.id) || ids.has(q.id)) throw Error('ID вопроса должен быть уникальным'); ids.add(q.id);
      if (typeof q.text !== 'string' || !q.text || q.text.length > 3000 || !['single','multiple','short','long','compound'].includes(q.type) || typeof q.required !== 'boolean') throw Error('Некорректный вопрос');
      if(q.type==='compound') {
        if(!Array.isArray(q.parts)||q.parts.length<2||q.parts.length>10) throw Error('Некорректные составные поля');
        const partIds=new Set();
        for(const part of q.parts) {
          if(!part||!safeId(part.id)||partIds.has(part.id)||typeof part.label!=='string'||!part.label.trim()||part.label.length>1000) throw Error('Некорректное составное поле');
          partIds.add(part.id);
          if(part.suggestions!==undefined&&(!Array.isArray(part.suggestions)||part.suggestions.length>30||part.suggestions.some(v=>typeof v!=='string'||!v.trim()||v.length>1000))) throw Error('Некорректные подсказки составного поля');
        }
      }
      if(q.followup!==undefined) {
        const f=q.followup;
        if(q.type!=='single'||!f||typeof f!=='object'||Array.isArray(f)||!Array.isArray(f.when)||!f.when.length||f.when.some(v=>!q.options?.includes(v))||typeof f.label!=='string'||!f.label.trim()||f.label.length>3000||typeof f.required!=='boolean'||!Number.isInteger(f.maxLength)||f.maxLength<1||f.maxLength>10000) throw Error('Некорректное уточнение ответа');
      }
      if(q.showWhen!==undefined) {
        const condition=q.showWhen;
        const prior=c.blocks.flatMap(block=>block.questions).find(item=>item.id===condition?.questionId);
        if(!condition||typeof condition!=='object'||Array.isArray(condition)||!safeId(condition.questionId)||condition.questionId===q.id||!ids.has(condition.questionId)||!prior||prior.type!=='single'||!Array.isArray(condition.values)||!condition.values.length||condition.values.some(v=>!prior.options?.includes(v))) throw Error('Некорректное условие видимости');
      }
      if(q.hint !== undefined && (typeof q.hint !== 'string' || q.hint.length>3000)) throw Error('Invalid question hint');
      if(q.maxLength !== undefined && (!Number.isInteger(q.maxLength) || q.maxLength<1 || q.maxLength>10000)) throw Error('Некорректный лимит текста');
      if(['single','multiple'].includes(q.type) && (!Array.isArray(q.options) || !q.options.length || q.options.length>30 || q.options.some(o=>typeof o!=='string'||!o||o.length>1000) || new Set(q.options).size !== q.options.length)) throw Error('Некорректные варианты');
    }
  }
  return c;
}
export function validateSubmission(p,c) {
  if(!p || typeof p.key !== 'string' || !/^[\w-]{8,100}$/.test(p.key)) throw Error('Некорректный ключ отправки');
  if(typeof p.name !== 'string' || !p.name.trim() || p.name.length>150) throw Error('Укажите имя');
  if(typeof p.contact !== 'string' || !p.contact.trim() || p.contact.length>200) throw Error('Укажите контакт');
  if(p.consent!==true) throw Error('Требуется согласие');
  if(!p.answers || typeof p.answers!=='object' || Array.isArray(p.answers)) throw Error('Некорректные ответы');
  if(c.blocks.some(b=>b.questions.some(q=>q.type==='compound'||q.followup||q.showWhen))) {
    const questions=c.blocks.flatMap(b=>b.questions), known=new Set(questions.map(q=>q.id)), answers=Object.create(null);
    if(Object.keys(p.answers).some(k=>!known.has(k))) throw Error('Неизвестный вопрос');
    for(const q of questions) answers[q.id]=isQuestionVisible(q,answers)?normalizeQuestionAnswer(q,p.answers[q.id],answers):'';
    return {key:p.key,version:p.version,name:p.name.trim(),contact:p.contact.trim(),consent:true,answers};
  }
  const answers=Object.create(null); const known=new Set();
  for(const b of c.blocks) for(const q of b.questions) {
    known.add(q.id); let v=p.answers[q.id];
    if(v && typeof v==='object' && !Array.isArray(v)) {
      const other=typeof v.other==='string'?v.other.trim():'';
      v=q.type==='multiple'?v.values:v.value;
      if(q.allowOther && other) { if(other.length> (q.maxLength||1000)) throw Error('Слишком длинный другой ответ'); v=Array.isArray(v)?v.filter(x=>x!=='__other__').concat(other):other; }
    }
    if(v==='__other__'||(Array.isArray(v)&&v.includes('__other__'))) throw Error(`Укажите другой ответ: ${q.text}`);
    const empty=v===undefined||v===null||v===''||(Array.isArray(v)&&v.length===0);
    if(empty){if(q.required) throw Error(`Ответьте на вопрос: ${q.text}`); answers[q.id]=q.type==='multiple'?[]:'';continue;}
    if(q.type==='multiple') {
      if(!Array.isArray(v)||v.length>30||v.some(x=>typeof x!=='string'||!x.trim()||x.length>(q.maxLength||1000)||(!q.options.includes(x)&&!q.allowOther))) throw Error(`Некорректный ответ: ${q.text}`);
      answers[q.id]=[...new Set(v.map(x=>x.trim()))];
    } else {
      if(typeof v!=='string'||!v.trim()||v.length>(q.maxLength|| (q.type==='short'?500:5000)) ||(q.type==='single'&&!q.options.includes(v)&&!q.allowOther)) throw Error(`Некорректный ответ: ${q.text}`);
      answers[q.id]=v.trim();
    }
  }
  if(Object.keys(p.answers).some(k=>!known.has(k))) throw Error('Неизвестный вопрос');
  return {key:p.key,version:p.version,name:p.name.trim(),contact:p.contact.trim(),consent:true,answers};
}
