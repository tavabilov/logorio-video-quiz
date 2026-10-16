import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
const code=readFileSync(new URL('../integrations/google-apps-script/Code.gs',import.meta.url),'utf8');
const seed=JSON.parse(readFileSync(new URL('../content/versions/1.json',import.meta.url),'utf8'));
const seed3=JSON.parse(readFileSync(new URL('../content/versions/3.json',import.meta.url),'utf8'));
const seed2=JSON.parse(readFileSync(new URL('../content/versions/2.json',import.meta.url),'utf8'));
function questions(c){return c.blocks.flatMap(b=>b.questions)}
function payload(c,version=1,key='test-key-123456'){
 const answers={};for(const q of questions(c))answers[q.id]=q.type==='compound'?{fields:Object.fromEntries(q.parts.map(p=>[p.id,'Синтетический тест']))}:q.followup?{value:q.followup.when[0],detail:'Синтетическое уточнение'}:q.options?(q.type==='multiple'?[q.options[0]]:q.options[0]):(q.required?'Синтетический тест':'');
 return{key,version,name:'Вымышленный родитель',contact:'synthetic@example.test',consent:true,answers};
}
function harness(){
 const sheets=new Map(),props=new Map([['SPREADSHEET_ID','private-test-sheet']]);let locked=false,flushes=0;
 function makeSheet(name){
  const rows=[],wraps=new Map(),rowHeights=new Map(),validations=new Map();let maxColumns=26;
  const sheet={rows,wraps,rowHeights,validations,name,getLastRow:()=>rows.length,getLastColumn:()=>Math.max(0,...rows.map(x=>x.length)),getMaxColumns:()=>maxColumns,insertColumnsAfter(_n,count){maxColumns+=count;},setRowHeight(row,pixels){rowHeights.set(row,pixels);return this},setRowHeights(start,count,pixels){for(let i=0;i<count;i++)rowHeights.set(start+i,pixels);return this},setFrozenRows(){return this},setFrozenColumns(){return this},setColumnWidths(){return this},setColumnWidth(){return this},getRange(r,c,n=1,w=1){
   if(c+w-1>maxColumns)throw Error('Column outside sheet grid');
   const range={setValues(values){values.forEach((v,i)=>{rows[r+i-1]??=[];v.forEach((x,j)=>{rows[r+i-1][c+j-1]=x})});return this},getValues(){return Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>rows[r+i-1]?.[c+j-1]??''))},setWrapStrategy(value){for(let i=0;i<n;i++)for(let j=0;j<w;j++)wraps.set(`${r+i}:${c+j}`,value);return this},setDataValidation(value){validations.set(`${r}:${c}`,value);return this},createTextFinder(key){return{matchEntireCell(){return this},findNext(){const i=rows.findIndex((x,i)=>i>=r-1&&i<r-1+n&&x[c-1]===key);return i<0?null:{getRow:()=>i+1}}}}};
   for(const method of ['setBackground','setFontColor','setFontFamily','setFontSize','setFontWeight','setWrap','setNumberFormat'])range[method]=function(){return this};return range;
  }};sheets.set(name,sheet);return sheet;
 }
 const ss={getSheetByName:name=>sheets.get(name),insertSheet:makeSheet};
 const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)??null,setProperty:(k,v)=>props.set(k,v)})},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},SpreadsheetApp:{WrapStrategy:{CLIP:'CLIP'},newDataValidation(){return{requireValueInList(values){this.values=Array.from(values);return this},setAllowInvalid(value){this.allowInvalid=value;return this},build(){return{values:this.values,allowInvalid:this.allowInvalid}}}},openById(id){assert.equal(id,'private-test-sheet');return ss},flush(){flushes++}},Utilities:{getUuid:randomUUID,formatDate:()=> '2026-10-15 12:00:00',DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,s)=>[...createHash('sha256').update(s).digest()]}});
 vm.runInContext(code,ctx);
 return{ctx,sheets,props,payload:payload(seed),flushes:()=>flushes,locked:()=>locked};
}
test('v1 retains sixteen exact questions, snapshot, receipt and retry behavior',()=>{
 const h=harness(),a=h.ctx.saveSubmission(h.payload),b=h.ctx.saveSubmission(h.payload),sheet=h.sheets.get('Ответы');
 assert.equal(a.number,'L-000001');assert.equal(b.number,a.number);assert.equal(sheet.rows.length,2);assert.equal(sheet.rows[1].length,25);
 const snapshot=JSON.parse(sheet.rows[1][8]);assert.deepEqual(snapshot.content,seed);assert.equal(Object.keys(snapshot.answers).length,16);assert.equal(snapshot.version,1);
 assert.equal(sheet.rows[1][4],'Новая');assert.equal(sheet.wraps.get('2:9'),'CLIP');assert.equal(sheet.rowHeights.get(2),68);assert.equal(h.locked(),false);
 assert.throws(()=>h.ctx.saveSubmission({...h.payload,name:'Другая отправка'}),/Ключ уже/);
});
test('v2 routes all fifty-eight questions to a separate schema without touching v1',()=>{
 const h=harness();h.ctx.saveSubmission(h.payload);const old=JSON.stringify(h.sheets.get('Ответы').rows);
 const p=payload(seed2,2,'version-two-key');const a=h.ctx.saveSubmission(p),sheet=h.sheets.get('Ответы — версия 2');
 assert.equal(a.number,'L-000002');assert.equal(sheet.rows[1].length,67);assert.equal(sheet.getMaxColumns(),67);assert.equal(sheet.rows[1][6],2);
 assert.equal(JSON.stringify(h.sheets.get('Ответы').rows),old);assert.equal(h.ctx.saveSubmission(h.payload).number,'L-000001');
 const snapshot=JSON.parse(sheet.rows[1][8]);assert.deepEqual(snapshot.content,seed2);assert.equal(Object.keys(snapshot.answers).length,58);
 assert.deepEqual(sheet.rows[0].slice(9),questions(seed2).map(q=>q.id+' · '+q.text));
 assert.deepEqual(sheet.validations.get('2:5'),{values:['Новая','В работе','Разобрана'],allowInvalid:false});assert.equal(sheet.rowHeights.get(2),68);
 assert.equal(h.ctx.saveSubmission(p).number,a.number);assert.equal(sheet.rows.length,2);
});
test('idempotency keys and the counter are shared across versions',()=>{
 const h=harness();h.ctx.saveSubmission(h.payload);
 assert.throws(()=>h.ctx.saveSubmission(payload(seed2,2,h.payload.key)),/Ключ уже/);
 assert.equal(h.sheets.has('Ответы — версия 2'),false);assert.equal(h.props.get('NEXT_SUBMISSION_NUMBER'),'2');
 h.ctx.saveSubmission(payload(seed2,2,'second-version-key'));assert.equal(h.props.get('NEXT_SUBMISSION_NUMBER'),'3');
});
test('legacy QUIZ_VERSION_1 property is honored and pinned against later mutation',()=>{
 const h=harness(),legacy=structuredClone(seed);legacy.title='Название ранее опубликованной версии';h.props.set('QUIZ_VERSION_1',JSON.stringify(legacy));
 h.ctx.saveSubmission(h.payload);assert.equal(JSON.parse(h.sheets.get('Ответы').rows[1][8]).content.title,legacy.title);
 legacy.title='Незаметная подмена версии';h.props.set('QUIZ_VERSION_1',JSON.stringify(legacy));
 assert.throws(()=>h.ctx.saveSubmission({...h.payload,key:'another-legacy-key'}),/версия изменена/);assert.equal(h.locked(),false);
});
test('quiz getters return independent copies and version two is pinned too',()=>{
 const h=harness(),c=h.ctx.quiz_(2);c.blocks[0].questions[0].text='mutation';assert.equal(h.ctx.quiz_(2).blocks[0].questions[0].text,seed2.blocks[0].questions[0].text);
 h.props.set('QUIZ_FINGERPRINT_2','not-the-published-content');assert.throws(()=>h.ctx.saveSubmission(payload(seed2,2)),/версия изменена/);
});
test('known version, consent, required answers, text limits and question IDs are validated',()=>{
 const h=harness();for(const p of [{...h.payload,version:4},{...h.payload,version:'1'},{...h.payload,consent:false},{...h.payload,answers:{...h.payload.answers,b1q1:''}},{...h.payload,answers:{...h.payload.answers,b1q2:'x'.repeat(301)}},{...h.payload,answers:{...h.payload.answers,unknown:'x'}},{...h.payload,key:'-formula-key'}])assert.throws(()=>h.ctx.saveSubmission(p));
 assert.equal(h.sheets.size,0);assert.equal(h.locked(),false);
});
test('exact source question order is checked before writing into an existing sheet',()=>{
 const h=harness();h.ctx.saveSubmission(payload(seed2,2));const s=h.sheets.get('Ответы — версия 2');[s.rows[0][9],s.rows[0][10]]=[s.rows[0][10],s.rows[0][9]];
 assert.throws(()=>h.ctx.saveSubmission(payload(seed2,2,'new-key-header-check')),/порядок идентификаторов/);assert.equal(s.rows.length,2);
});
function largePayload(){
 const p=payload(seed2,2,'large-synthetic-key');
 for(const q of questions(seed2))if(!q.options){let text='СИНТЕТИЧЕСКИЙ ТЕСТ 🙂 '.repeat(250).slice(0,q.maxLength||2000);if(/[\uD800-\uDBFF]/.test(text.at(-1)))text=text.slice(0,-1);p.answers[q.id]=text;}
 return p;
}
test('large v2 JSON is stored losslessly in safe chunks and read back before receipt',()=>{
 const h=harness(),p=largePayload(),receipt=h.ctx.saveSubmission(p),sheet=h.sheets.get('Ответы — версия 2'),chunks=h.sheets.get('Снимки — версия 2');
 const manifest=JSON.parse(sheet.rows[1][8]);assert.equal(manifest.format,'logorio-json-chunks-v1');assert.ok(manifest.parts>1);assert.ok(manifest.totalChars>49000);
 for(const row of chunks.rows.slice(1)){assert.ok(row[3].startsWith('json:'));assert.ok(row[3].length<=40005);assert.ok(!/[\uD800-\uDBFF]$/.test(row[3]));}
 const snapshot=h.ctx.readSnapshot_({getSheetByName:n=>h.sheets.get(n)},sheet.rows[1][8]);assert.deepEqual(JSON.parse(JSON.stringify(snapshot.answers)),p.answers);assert.deepEqual(JSON.parse(JSON.stringify(snapshot.content)),seed2);
 assert.equal(h.ctx.saveSubmission(p).number,receipt.number);assert.equal(sheet.rows.length,2);assert.equal(chunks.rows.length,manifest.parts+1);
});
test('corrupted chunked snapshot cannot produce a successful retry',()=>{
 const h=harness(),p=largePayload();h.ctx.saveSubmission(p);h.sheets.get('Снимки — версия 2').rows[1][3]+='tampered';
 assert.throws(()=>h.ctx.saveSubmission(p),/Снимок повреждён/);assert.equal(h.locked(),false);assert.equal(h.sheets.get('Ответы — версия 2').rows.length,2);
});
test('formula-looking text is neutralized and multiple other answers normalize',()=>{
 const h=harness();h.ctx.saveSubmission({...h.payload,name:'=HYPERLINK("evil")',answers:{...h.payload.answers,b1q1:{value:'__other__',other:' =IMPORTXML("evil")'},b6q1:{values:['Игры с игрушками','__other__'],other:'Вымышленные кубики'}}});
 const row=h.sheets.get('Ответы').rows[1];assert.ok(row[2].startsWith("'="));assert.ok(row[9].startsWith("'="));assert.deepEqual(JSON.parse(row[8]).answers.b6q1,['Игры с игрушками','Вымышленные кубики']);
});
test('failed write confirmation releases lock, and retry returns the saved receipt',()=>{
 const h=harness(),p=largePayload();h.ctx.SpreadsheetApp.flush=()=>{throw Error('write failed')};assert.throws(()=>h.ctx.saveSubmission(p),/write failed/);assert.equal(h.locked(),false);
 h.ctx.SpreadsheetApp.flush=()=>{};assert.equal(h.ctx.saveSubmission(p).number,'L-000001');assert.equal(h.sheets.get('Ответы — версия 2').rows.length,2);
});
test('missing configuration never claims success',()=>{const h=harness();h.props.delete('SPREADSHEET_ID');assert.throws(()=>h.ctx.saveSubmission(h.payload),/не настроен/);assert.equal(h.sheets.size,0);assert.equal(h.locked(),false)});

test('bridge pins parent origin/window/nonce and sends only confirmed receipt',()=>{
 const html=readFileSync(new URL('../integrations/google-apps-script/Bridge.html',import.meta.url),'utf8');
 const js=html.split('<script>')[1].split('</script>')[0].replace('<?!= JSON.stringify(channel) ?>','"nonce-12345"').replace('<?!= JSON.stringify(allowedOrigin) ?>','"https://tavabilov.github.io"');
 const sent=[];let listener,success,failure,calls=0;
 const top={postMessage:(m,origin)=>sent.push({m,origin})};
 const run={withSuccessHandler(fn){success=fn;return this},withFailureHandler(fn){failure=fn;return this},saveSubmission(){calls++}};
 vm.runInNewContext(js,{window:{top,addEventListener:(_,fn)=>{listener=fn}},document:{getElementById:()=>({textContent:''})},google:{script:{run}}});
 assert.equal(sent[0].m.type,'logorio:ready');assert.equal(sent[0].origin,'https://tavabilov.github.io');
 const data={type:'logorio:submit',channel:'nonce-12345',requestId:'request-12345',payload:{name:'Private'}};
 listener({origin:'https://evil.test',source:top,data});listener({origin:'https://tavabilov.github.io',source:{},data});listener({origin:'https://tavabilov.github.io',source:top,data:{...data,channel:'wrong-nonce'}});assert.equal(calls,0);
 listener({origin:'https://tavabilov.github.io',source:top,data});assert.equal(calls,1);assert.equal(sent.length,1);
 success({id:'id-12345',number:'L-000001',answers:{private:'must not return'}});
 assert.deepEqual(Object.keys(sent[1].m).sort(),['channel','id','number','requestId','type']);assert.equal(sent[1].m.type,'logorio:receipt');
 listener({origin:'https://tavabilov.github.io',source:top,data});failure({message:'Private backend details'});assert.equal(sent.at(-1).m.type,'logorio:error');assert.ok(!JSON.stringify(sent.at(-1)).includes('Private'));
});

test('v3 preserves all 77 source rows in ten steps and leaves legacy sheets unchanged',()=>{
 const h=harness();h.ctx.saveSubmission(h.payload);h.ctx.saveSubmission(payload(seed2,2,'legacy-v2-first'));
 const old=JSON.stringify([...h.sheets].map(([name,s])=>[name,s.rows]));
 const p=payload(seed3,3,'version-three-key'), normalized=h.ctx.validateSubmission(p,seed3), result=h.ctx.saveSubmission(p), s=h.sheets.get('Ответы — версия 3');
 assert.equal(seed3.blocks.length,10);assert.equal(questions(seed3).length,77);assert.equal(s.rows[1].length,86);assert.equal(s.getMaxColumns(),86);assert.equal(s.rows[1][6],3);
 assert.equal(JSON.stringify([...h.sheets].filter(([name])=>name!=='Ответы — версия 3').map(([name,s])=>[name,s.rows])),old);
 assert.deepEqual(s.rows[0].slice(9),questions(seed3).map(q=>q.id+' · '+q.text));
 const saved=h.ctx.readSnapshot_({getSheetByName:n=>h.sheets.get(n)},s.rows[1][8]);
 assert.deepEqual(JSON.parse(JSON.stringify(saved.content)),seed3);assert.deepEqual(JSON.parse(JSON.stringify(saved.answers)),JSON.parse(JSON.stringify(normalized.answers)));assert.equal(Object.keys(saved.answers).length,77);
 assert.match(s.rows[1][11],/Беременность по счёту: Синтетический тест/);
 assert.equal(h.ctx.saveSubmission(p).number,result.number);assert.equal(s.rows.length,2);
 assert.throws(()=>h.ctx.saveSubmission({...p,key:h.payload.key}),/Ключ уже/);
});

test('v3 Node and GAS agree on compounds, conditional requirements and clearing stale hidden answers',async()=>{
 const {validateContent,validateSubmission}=await import('../lib/validation.mjs');assert.doesNotThrow(()=>validateContent(seed3));
 const h=harness(),base=payload(seed3,3),question=questions(seed3).find(q=>q.followup?.required&&!q.showWhen),optional=questions(seed3).find(q=>q.followup&&!q.followup.required),compound=questions(seed3).find(q=>q.type==='compound'),hidden=questions(seed3).find(q=>q.showWhen),parent=questions(seed3).find(q=>q.id===hidden.showWhen.questionId);
 function both(p){const node=validateSubmission(p,seed3),gas=h.ctx.validateSubmission(p,seed3);assert.deepEqual(JSON.parse(JSON.stringify(gas)),JSON.parse(JSON.stringify(node)));return node;}
 both(base);
 for(const bad of [{value:question.followup.when[0],detail:''},{value:'Несуществующий вариант',detail:'тест'},{value:question.followup.when[0],detail:'x'.repeat(question.followup.maxLength+1)}]){
  const p=structuredClone(base);p.answers[question.id]=bad;assert.throws(()=>validateSubmission(p,seed3));assert.throws(()=>h.ctx.validateSubmission(p,seed3));
 }
 const p=structuredClone(base),nonTrigger=question.options.find(v=>!question.followup.when.includes(v));p.answers[question.id]={value:nonTrigger,detail:'устаревший текст'};p.answers[optional.id]={value:optional.followup.when[0],detail:''};p.answers[parent.id]=parent.options.find(v=>!hidden.showWhen.values.includes(v));
 for(const q of questions(seed3).filter(q=>q.showWhen?.questionId===parent.id))p.answers[q.id]={invalid:'x'.repeat(10000)};
 const normalized=both(p);assert.equal(normalized.answers[question.id].detail,'');assert.equal(normalized.answers[hidden.id],'');
 const emptyHidden=structuredClone(p);for(const q of questions(seed3).filter(q=>q.showWhen?.questionId===parent.id))emptyHidden.answers[q.id]='';assert.deepEqual(both(emptyHidden),normalized);
 const missing=structuredClone(base);missing.answers[compound.id]={fields:{[compound.parts[0].id]:'Первая'}};assert.throws(()=>both(missing),/Укажите/);
 const invalidPart=structuredClone(base);invalidPart.answers[compound.id].fields.unknown='text';assert.throws(()=>both(invalidPart),/Некорректные поля/);
 const unknown=structuredClone(base);unknown.answers.unknown='text';assert.throws(()=>both(unknown),/Неизвестный вопрос/);
});

test('v3 large structured snapshots use their own chunks and preserve all fields and details',()=>{
 const h=harness(),p=payload(seed3,3,'large-version-three');
 for(const q of questions(seed3)){
  if(q.followup)p.answers[q.id]={value:q.followup.when[0],detail:'СИНТЕТИКА 🙂 '.repeat(400).slice(0,3900)};
  else if(q.type==='long'||q.type==='short')p.answers[q.id]='СИНТЕТИКА '.repeat(450).slice(0,q.maxLength||450);
 }
 const expected=h.ctx.validateSubmission(p,seed3),r=h.ctx.saveSubmission(p),s=h.sheets.get('Ответы — версия 3'),manifest=JSON.parse(s.rows[1][8]);
 assert.equal(manifest.snapshotSheet,'Снимки — версия 3');assert.ok(manifest.totalChars>49000);assert.equal(h.sheets.has('Снимки — версия 2'),false);
 const saved=h.ctx.readSnapshot_({getSheetByName:n=>h.sheets.get(n)},s.rows[1][8]);assert.deepEqual(JSON.parse(JSON.stringify(saved.answers)),JSON.parse(JSON.stringify(expected.answers)));assert.equal(Object.keys(saved.answers).length,77);
 assert.equal(h.ctx.saveSubmission(p).number,r.number);assert.equal(s.rows.length,2);
 h.sheets.get('Снимки — версия 3').rows[1][3]+='corruption';assert.throws(()=>h.ctx.saveSubmission(p),/Снимок повреждён/);
});

test('extended content rejects unsafe part IDs, invalid followups and forward visibility references',async()=>{
 const {validateContent}=await import('../lib/validation.mjs');
 for(const mutate of [c=>c.blocks[0].questions[2].parts[0].id='__proto__',c=>c.blocks[1].questions[1].followup.when=['Unknown'],c=>c.blocks[0].questions[0].showWhen={questionId:'v3_b3_q4',values:['Да']}]){const c=structuredClone(seed3);mutate(c);assert.throws(()=>validateContent(c));}
});


test('GAS shared rules remain an exact build copy of the browser rule module',()=>{
 const rules=readFileSync(new URL('../public/question-rules.js',import.meta.url),'utf8').replaceAll('export function','function');
 assert.ok(code.includes(rules.trim()),'Regenerate the GAS rule copy after changing shared rules');
});
