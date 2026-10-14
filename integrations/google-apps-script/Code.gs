const INITIAL_QUIZ = {
  "title": "Давайте поговорим о речи вашего ребёнка",
  "offer": "Посмотрите видео и поделитесь наблюдениями. Ответы помогут сотруднику центра подготовиться к разговору с вами.",
  "intro": "Восемь небольших шагов. В каждом — видео и два вопроса. Можно вернуться назад или продолжить позже на этом устройстве.",
  "completionText": "Сотрудник центра сможет ознакомиться с вашими ответами. Порядок обратной связи будет добавлен после согласования.",
  "introVideo": "/media/demo.mp4",
  "demo": true,
  "blocks": [
    {
      "id": "b1",
      "title": "Знакомство",
      "description": "Начнём с того, как ребёнок общается в повседневной жизни.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b1q1",
          "text": "Как ребёнок обычно выражает свои просьбы?",
          "type": "single",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Словами",
            "Жестами",
            "Словами и жестами",
            "Не знаю"
          ],
          "allowOther": true
        },
        {
          "id": "b1q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "short",
          "required": false,
          "maxLength": 300
        }
      ]
    },
    {
      "id": "b2",
      "title": "Понимание речи",
      "description": "Вспомните простые просьбы и привычные ситуации дома.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b2q1",
          "text": "Как ребёнок реагирует на знакомую простую просьбу?",
          "type": "single",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Обычно понимает",
            "Иногда нужна подсказка",
            "Пока трудно ответить",
            "Не наблюдал(а)"
          ],
          "allowOther": true
        },
        {
          "id": "b2q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b3",
      "title": "Слова и фразы",
      "description": "Подумайте о словах и фразах, которые слышите чаще всего.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b3q1",
          "text": "Как ребёнок чаще всего говорит?",
          "type": "single",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Отдельными словами",
            "Короткими фразами",
            "Развёрнутыми фразами",
            "Пока не использует слова"
          ],
          "allowOther": true
        },
        {
          "id": "b3q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b4",
      "title": "Звуки речи",
      "description": "Опишите свои наблюдения — специальных знаний не нужно.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b4q1",
          "text": "Как часто вам легко понять речь ребёнка?",
          "type": "single",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Обычно легко",
            "Иногда переспрашиваю",
            "Часто трудно понять",
            "Не знаю"
          ],
          "allowOther": true
        },
        {
          "id": "b4q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b5",
      "title": "Общение",
      "description": "Вспомните общение с близкими и другими людьми.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b5q1",
          "text": "В каких ситуациях ребёнок охотнее общается?",
          "type": "single",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Дома с близкими",
            "Во время игры",
            "С другими детьми",
            "Пока трудно ответить"
          ],
          "allowOther": true
        },
        {
          "id": "b5q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b6",
      "title": "Игры и интересы",
      "description": "Расскажите, что увлекает ребёнка и поддерживает общение.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b6q1",
          "text": "Какие занятия ребёнку нравятся?",
          "type": "multiple",
          "required": true,
          "maxLength": 2000,
          "options": [
            "Игры с игрушками",
            "Книги и картинки",
            "Подвижные игры",
            "Музыка и песни"
          ],
          "allowOther": true
        },
        {
          "id": "b6q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b7",
      "title": "Ваши наблюдения",
      "description": "Здесь можно собрать то, что кажется вам важным.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b7q1",
          "text": "Что вы хотели бы обсудить со специалистом?",
          "type": "long",
          "required": true,
          "maxLength": 2000
        },
        {
          "id": "b7q2",
          "text": "Можете привести пример или добавить наблюдение?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    },
    {
      "id": "b8",
      "title": "Ваш запрос",
      "description": "Сформулируйте, с чем вы хотели бы обратиться в центр.",
      "video": "/media/demo.mp4",
      "poster": "/poster.svg",
      "transcript": "Это демонстрационное видео со звуком. Позже здесь появится материал центра «Логорио» по теме блока. Сейчас можно проверить воспроизведение, посмотреть вопросы и пройти тестовый сценарий. Вопросы предварительные и должны быть утверждены специалистом центра.",
      "questions": [
        {
          "id": "b8q1",
          "text": "Какой вопрос вы хотели бы задать центру?",
          "type": "long",
          "required": true,
          "maxLength": 2000
        },
        {
          "id": "b8q2",
          "text": "Что ещё нам стоит знать перед разговором?",
          "type": "long",
          "required": false,
          "maxLength": 2000
        }
      ]
    }
  ]
};
function validateSubmission(p,c) {
  if(!p || typeof p.key !== 'string' || !/^[\w-]{8,100}$/.test(p.key)) throw Error('Некорректный ключ отправки');
  if(typeof p.name !== 'string' || !p.name.trim() || p.name.length>150) throw Error('Укажите имя');
  if(typeof p.contact !== 'string' || !p.contact.trim() || p.contact.length>200) throw Error('Укажите контакт');
  if(p.consent!==true) throw Error('Требуется согласие');
  if(!p.answers || typeof p.answers!=='object' || Array.isArray(p.answers)) throw Error('Некорректные ответы');
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

const META_HEADERS = ['Номер','Дата (Москва)','Имя взрослого','Контакт','Статус','Заметка сотрудника','Версия квиза','Ключ отправки','Ответы JSON'];
function properties_(){ return PropertiesService.getScriptProperties(); }
function quiz_(){
  const raw=properties_().getProperty('QUIZ_VERSION_1');
  return raw ? JSON.parse(raw) : INITIAL_QUIZ;
}
function doGet(e){
  const channel=String((e && e.parameter && e.parameter.channel)||'');
  if(!/^[\w-]{8,100}$/.test(channel)) throw Error('Некорректный канал');
  const t=HtmlService.createTemplateFromFile('Bridge');
  t.channel=channel;
  t.allowedOrigin='https://tavabilov.github.io';
  return t.evaluate().setTitle('Логорио — отправка').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function textCell_(v){
  const s=String(v==null?'':v);
  return /^[\s]*[=+@-]/.test(s) ? "'"+s : s;
}
function saveSubmission(p){
  if(!p || p.version!==1) throw Error('Неизвестная версия квиза');
  if(typeof p.key!=='string'||!/^[A-Za-z0-9][\w-]{7,99}$/.test(p.key)) throw Error('Некорректный ключ отправки');
  if(JSON.stringify(p).length>60000) throw Error('Отправка слишком большая');
  const c=quiz_();
  const normalized=validateSubmission(p,c);
  const canonical=JSON.stringify(normalized);
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,canonical,Utilities.Charset.UTF_8).map(x=>('0'+(x&255).toString(16)).slice(-2)).join('');
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props=properties_(), sid=props.getProperty('SPREADSHEET_ID');
    if(!sid) throw Error('Приём ответов ещё не настроен');
    const ss=SpreadsheetApp.openById(sid);
    const sheet=ss.getSheetByName('Ответы')||ss.insertSheet('Ответы');
    const questions=c.blocks.reduce((a,b)=>a.concat(b.questions),[]);
    const headers=META_HEADERS.concat(questions.map(q=>q.id+' · '+q.text));
    if(sheet.getLastRow()===0) sheet.getRange(1,1,1,headers.length).setValues([headers]);
    // Validate identity-bearing positions; descriptive headers may be customized by the owner.
    if(sheet.getLastColumn()<25) throw Error('Таблица должна иметь 9 служебных и 16 колонок ответов');
    const last=sheet.getLastRow();
    if(last>1){
      const found=sheet.getRange(2,8,last-1,1).createTextFinder(normalized.key).matchEntireCell(true).findNext();
      if(found){
        const row=sheet.getRange(found.getRow(),1,1,9).getValues()[0];
        const stored=JSON.parse(row[8]);
        if(stored.hash!==hash) throw Error('Ключ уже использован для других ответов');
        SpreadsheetApp.flush();
        return {id:normalized.key,number:String(row[0])};
      }
    }
    const counter=Number(props.getProperty('NEXT_SUBMISSION_NUMBER')||'1');
    if(!Number.isSafeInteger(counter)||counter<1) throw Error('Некорректный счётчик');
    // Reserve number before writing: failures may leave gaps but never reuse a number.
    props.setProperty('NEXT_SUBMISSION_NUMBER',String(counter+1));
    const number='L-'+String(counter).padStart(6,'0');
    const snapshot=JSON.stringify({hash,consent:true,version:1,content:c,answers:normalized.answers});
    if(snapshot.length>49000) throw Error('Снимок превышает лимит ячейки');
    const cells=[number,Utilities.formatDate(new Date(),'Europe/Moscow','yyyy-MM-dd HH:mm:ss'),textCell_(normalized.name),textCell_(normalized.contact),'Новая','',1,normalized.key,snapshot]
      .concat(questions.map(q=>textCell_(Array.isArray(normalized.answers[q.id])?normalized.answers[q.id].join(' | '):normalized.answers[q.id])));
    const destination=sheet.getLastRow()+1;
    sheet.getRange(destination,1,1,cells.length).setValues([cells]);
    sheet.getRange(destination,9).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    sheet.setRowHeight(destination,68);
    SpreadsheetApp.flush();
    const receipt=sheet.getRange(destination,1,1,9).getValues()[0];
    if(receipt[0]!==number||receipt[7]!==normalized.key||JSON.parse(receipt[8]).hash!==hash) throw Error('Не удалось подтвердить сохранение. Повторите отправку');
    return {id:normalized.key,number};
  } finally { lock.releaseLock(); }
}
