import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const content={demo:true,title:'Тест',offer:'Оффер',intro:'Вступление',completionText:'Спасибо',blocks:[{id:'b',title:'Блок',description:'Описание',transcript:'Текст',video:'/media/demo.mp4',questions:[{id:'q',text:'Вопрос',type:'single',required:true,options:['Да','Нет']}]}]};
test('backend integration: authentication, versions, duplicate submission, uploads, review',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'quiz-test-'));const seed=path.join(dir,'seed.json');writeFileSync(seed,JSON.stringify(content));
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,DATA_DIR:dir,CONTENT_FILE:seed,ADMIN_PASSWORD:'test-password-strong-123',PORT:'0'},stdio:['ignore','pipe','pipe']});
 let origin;await new Promise((resolve,reject)=>{let out='';child.stdout.on('data',d=>{out+=d;if(/http:\/\/127\.0\.0\.1:\d+/.test(out)){origin=out.match(/http:\/\/127\.0\.0\.1:\d+/)[0];resolve();}});child.on('exit',c=>reject(Error('server exited '+c)));setTimeout(()=>reject(Error('server startup timeout')),10000).unref();});
 let cookie='',csrf='';const req=async(url,method='GET',body,extra={})=>{const headers={...extra};if(cookie)headers.Cookie=cookie;if(csrf)headers['X-CSRF-Token']=csrf;if(body!==undefined&&!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body);}return fetch(origin+url,{method,headers,body});};
 try{
 assert.equal((await req('/api/admin/submissions')).status,401);
 assert.equal((await req('/api/admin/login','POST',{password:'bad'})).status,401);
 const login=await req('/api/admin/login','POST',{password:'test-password-strong-123'});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];csrf=(await login.json()).csrfToken;
 const noCsrf=await fetch(origin+'/api/admin/content',{method:'PUT',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({content})});assert.equal(noCsrf.status,403);
 assert.equal((await req('/api/admin/content','PUT',{content},{Origin:'https://evil.example'})).status,403);
 const p={key:'unique-key-123',version:1,name:'Тест',contact:'test@example.invalid',consent:true,answers:{q:'Да'}};
 const simultaneous=await Promise.all([req('/api/submissions','POST',p),req('/api/submissions','POST',p)]);const cards=await Promise.all(simultaneous.map(r=>r.json()));assert.equal(cards[0].id,cards[1].id);
 assert.equal((await req('/api/submissions','POST',{...p,answers:{q:'Нет'}})).status,409);
 assert.equal((await req('/api/submissions','POST',{...p,key:'invalid-key-124',answers:{q:'wrong'}})).status,400);
 const draft=structuredClone(content);draft.blocks[0].questions[0].text='Новый вопрос';assert.equal((await req('/api/admin/content','PUT',{content:draft})).status,200);
 assert.equal((await (await req('/api/quiz')).json()).version,1);assert.equal((await (await req('/api/admin/publish','POST',{})).json()).version,2);
 assert.equal((await (await req('/api/quiz/1')).json()).content.blocks[0].questions[0].text,'Вопрос');
 const card=await(await req('/api/admin/submissions/'+cards[0].id)).json();assert.equal(card.content.blocks[0].questions[0].text,'Вопрос');assert.equal(card.answers.q,'Да');
 assert.equal((await req('/api/admin/submissions/'+cards[0].id,'PATCH',{status:'in_progress',note:'Тест заметки'})).status,200);
 assert.equal((await(await req('/api/admin/submissions?status=in_progress')).json()).submissions.length,1);
 const {DatabaseSync}=await import('node:sqlite');const dateDb=new DatabaseSync(path.join(dir,'quiz.sqlite'));dateDb.prepare('UPDATE submissions SET createdAt=? WHERE id=?').run('2026-10-14T22:30:00.000Z',cards[0].id);dateDb.close();assert.equal((await(await req('/api/admin/submissions?date=2026-10-15')).json()).submissions.length,1);assert.equal((await(await req('/api/admin/submissions?date=2026-10-14')).json()).submissions.length,0);
 const mp4=Buffer.alloc(80);mp4.writeUInt32BE(24,0);mp4.write('ftyp',4);mp4.write('isom',8);const f=new FormData();f.append('video',new Blob([mp4],{type:'video/mp4'}),'test.mp4');const u=await req('/api/admin/upload','POST',f);assert.equal(u.status,200);const media=(await u.json()).url;
 const range=await req(media,'GET',undefined,{Range:'bytes=0-15'});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);
 const bad=new FormData();bad.append('video',new Blob(['not mp4'],{type:'video/mp4'}),'bad.mp4');assert.equal((await req('/api/admin/upload','POST',bad)).status,400);
 assert.equal((await req('/api/admin/submissions/'+cards[0].id,'DELETE')).status,200);assert.equal((await req('/api/admin/submissions/'+cards[0].id)).status,404);const {readDeletions}=await import('../lib/deletions.mjs');assert.ok(readDeletions(dir).includes(cards[0].id));
 assert.equal((await req('/api/admin/logout','POST',{})).status,200);assert.equal((await req('/api/admin/session')).status,401);
 }finally{child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));rmSync(dir,{recursive:true,force:true});}
});

test('online backup preserves database snapshot and uploaded media',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const {mkdirSync,readFileSync,readdirSync}=await import('node:fs');
 const dir=mkdtempSync(path.join(tmpdir(),'quiz-backup-'));mkdirSync(path.join(dir,'uploads'));writeFileSync(path.join(dir,'uploads','example.mp4'),'media-fixture');
 const db=new DatabaseSync(path.join(dir,'quiz.sqlite'));db.exec('PRAGMA journal_mode=WAL; CREATE TABLE entries(id INTEGER PRIMARY KEY,note TEXT);');db.prepare('INSERT INTO entries(note) VALUES(?)').run('сохранённый ответ');
 try{
 const child=spawn(process.execPath,['scripts/backup.mjs'],{env:{...process.env,DATA_DIR:dir},stdio:'ignore'});assert.equal(await new Promise(resolve=>child.once('exit',resolve)),0);
 const copy=path.join(dir,'backups',readdirSync(path.join(dir,'backups'))[0]);const restored=new DatabaseSync(path.join(copy,'quiz.sqlite'));assert.equal(restored.prepare('SELECT note FROM entries').get().note,'сохранённый ответ');restored.close();assert.equal(readFileSync(path.join(copy,'uploads','example.mp4'),'utf8'),'media-fixture');
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});

test('restore applies deletions recorded after backup and preserves ledger',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const {readdirSync}=await import('node:fs');const {writeDeletions,readDeletions}=await import('../lib/deletions.mjs');
 const dir=mkdtempSync(path.join(tmpdir(),'quiz-delete-restore-'));const db=new DatabaseSync(path.join(dir,'quiz.sqlite'));db.exec('CREATE TABLE submissions(id TEXT PRIMARY KEY); CREATE TABLE sessions(id TEXT PRIMARY KEY);');const removed='a'.repeat(32),kept='b'.repeat(32);db.prepare('INSERT INTO submissions VALUES(?)').run(removed);db.prepare('INSERT INTO submissions VALUES(?)').run(kept);db.prepare('INSERT INTO sessions VALUES(?)').run('old-session');db.close();
 const run=async(args)=>{const p=spawn(process.execPath,args,{env:{...process.env,DATA_DIR:dir},stdio:'ignore'});return new Promise(resolve=>p.once('exit',resolve));};
 try{assert.equal(await run(['scripts/backup.mjs']),0);const copy=path.join(dir,'backups',readdirSync(path.join(dir,'backups'))[0]);writeDeletions(dir,[removed]);assert.equal(await run(['scripts/restore.mjs',copy]),0);const restored=new DatabaseSync(path.join(dir,'quiz.sqlite'));assert.equal(restored.prepare('SELECT id FROM submissions WHERE id=?').get(removed),undefined);assert.equal(restored.prepare('SELECT id FROM submissions WHERE id=?').get(kept).id,kept);assert.equal(restored.prepare('SELECT count(*) AS n FROM sessions').get().n,0);restored.close();assert.ok(readDeletions(dir).includes(removed));
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('content rejects prototype IDs and nonboolean demo',async()=>{const {validateContent}=await import('../lib/validation.mjs');for(const id of ['__proto__','constructor','prototype','bad.id','x'.repeat(81)]){const c=structuredClone(content);c.blocks[0].questions[0].id=id;assert.throws(()=>validateContent(c));}const c=structuredClone(content);c.demo='true';assert.throws(()=>validateContent(c));});

test('question hint is optional bounded text',async()=>{const {validateContent}=await import('../lib/validation.mjs');const c=structuredClone(content);c.blocks[0].questions[0].hint='Helpful text';assert.doesNotThrow(()=>validateContent(c));for(const hint of [42,'x'.repeat(3001)]){c.blocks[0].questions[0].hint=hint;assert.throws(()=>validateContent(c));}});
