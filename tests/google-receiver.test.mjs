import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const code=readFileSync(new URL('../integrations/google-apps-script/Code.gs',import.meta.url),'utf8');
const seed=JSON.parse(readFileSync(new URL('../content/quiz.json',import.meta.url),'utf8'));
function harness(){
 const rows=[], props=new Map([['SPREADSHEET_ID','private-test-sheet']]);
 let locked=false, flushes=0;
 const sheet={getLastRow:()=>rows.length,getLastColumn:()=>Math.max(0,...rows.map(x=>x.length)),getRange(r,c,n,w){return {setValues(values){values.forEach((v,i)=>{rows[r+i-1]??=[]; v.forEach((x,j)=>{rows[r+i-1][c+j-1]=x})})},getValues(){return Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>rows[r+i-1]?.[c+j-1]??''))},createTextFinder(key){return{matchEntireCell(){return this},findNext(){const idx=rows.findIndex((x,i)=>i>=r-1&&i<r-1+n&&x[c-1]===key);return idx<0?null:{getRow:()=>idx+1}}}}}}};
 const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)??null,setProperty:(k,v)=>props.set(k,v)})},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true},releaseLock(){locked=false}})},SpreadsheetApp:{openById(id){assert.equal(id,'private-test-sheet');return{getSheetByName:()=>sheet,insertSheet:()=>sheet}},flush(){flushes++}},Utilities:{formatDate:()=> '2026-10-15 12:00:00',DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,s)=>[...createHash('sha256').update(s).digest()]}});
 vm.runInContext(code,ctx);
 const answers={}; for(const b of seed.blocks) for(const q of b.questions)answers[q.id]=q.options?(q.type==='multiple'?[q.options[0]]:q.options[0]):(q.required?'Тестовый вопрос':'');
 const payload={key:'test-key-123456',version:1,name:'Тестовый родитель',contact:'parent@example.test',consent:true,answers};
 return {ctx,rows,props,payload,flushes:()=>flushes,locked:()=>locked};
}
test('writes all 16 answers and immutable source snapshot before returning receipt',()=>{
 const h=harness(), receipt=h.ctx.saveSubmission(h.payload);
 assert.equal(receipt.id,h.payload.key);assert.equal(receipt.number,'L-000001');assert.equal(h.rows.length,2);assert.equal(h.rows[1].length,25);assert.equal(h.flushes(),1);assert.equal(h.locked(),false);assert.equal(h.rows[1][4],'Новая');assert.equal(h.rows[1][5],'');assert.equal(h.rows[1][6],1);assert.equal(h.rows[1][1],'2026-10-15 12:00:00');
 const snapshot=JSON.parse(h.rows[1][8]);assert.deepEqual(snapshot.content,seed);assert.equal(Object.keys(snapshot.answers).length,16);assert.equal(snapshot.version,1);assert.equal(snapshot.consent,true);assert.deepEqual(h.rows[0].slice(0,9),['Номер','Дата (Москва)','Имя взрослого','Контакт','Статус','Заметка сотрудника','Версия квиза','Ключ отправки','Ответы JSON']);
});
test('identical retry returns same receipt and no extra row; altered retry rejected',()=>{
 const h=harness();const a=h.ctx.saveSubmission(h.payload),b=h.ctx.saveSubmission(h.payload);assert.equal(a.number,b.number);assert.equal(h.rows.length,2);
 assert.throws(()=>h.ctx.saveSubmission({...h.payload,name:'Другой'}),/Ключ уже/);assert.equal(h.rows.length,2);assert.equal(h.locked(),false);
});
test('requires known version, consent, required answers, bounded text and known question IDs',()=>{
 const h=harness();
 for(const p of [{...h.payload,version:2},{...h.payload,consent:false},{...h.payload,answers:{...h.payload.answers,b1q1:''}},{...h.payload,answers:{...h.payload.answers,b1q2:'x'.repeat(301)}},{...h.payload,answers:{...h.payload.answers,unknown:'x'}}])assert.throws(()=>h.ctx.saveSubmission(p));
 assert.equal(h.rows.length,0);
});
test('other answers normalize and formula-looking text is neutralized',()=>{
 const h=harness();const p={...h.payload,name:'=HYPERLINK("evil")',contact:' +100',answers:{...h.payload.answers,b1q1:{value:'__other__',other:' =IMPORTXML("evil")'},b6q1:{values:['Игры с игрушками','__other__'],other:'Кубики'}}};
 h.ctx.saveSubmission(p);assert.ok(h.rows[1][2].startsWith("'="));assert.ok(h.rows[1][3].startsWith("'+"));assert.ok(h.rows[1][9].startsWith("'="));
 assert.deepEqual(JSON.parse(h.rows[1][8]).answers.b6q1,['Игры с игрушками','Кубики']);
});
test('write failures release lock and do not claim success',()=>{
 const h=harness();h.ctx.SpreadsheetApp.flush=()=>{throw Error('write failed')};assert.throws(()=>h.ctx.saveSubmission(h.payload),/write failed/);assert.equal(h.locked(),false);
 // Row persisted despite confirmation failure: retry resolves to the same receipt.
 h.ctx.SpreadsheetApp.flush=()=>{};assert.equal(h.ctx.saveSubmission(h.payload).number,'L-000001');assert.equal(h.rows.length,2);
});
test('missing configuration cannot claim success',()=>{const h=harness();h.props.delete('SPREADSHEET_ID');assert.throws(()=>h.ctx.saveSubmission(h.payload),/не настроен/);assert.equal(h.rows.length,0);assert.equal(h.locked(),false)});
test('formula-looking idempotency key is rejected',()=>{const h=harness();assert.throws(()=>h.ctx.saveSubmission({...h.payload,key:'-formula-key'}),/ключ/);assert.equal(h.rows.length,0)});
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
