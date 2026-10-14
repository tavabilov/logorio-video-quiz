import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const data=mkdtempSync(path.join(tmpdir(),'logorio-ui-')),port=4187,base=`http://127.0.0.1:${port}`;
const password='synthetic-local-test-password-2026';
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),DATA_DIR:data,ADMIN_PASSWORD:password},stdio:'ignore'});
const out=path.resolve('.impeccable/review');mkdirSync(out,{recursive:true});
const report={checkedAt:new Date().toISOString(),scope:'Local isolated test database; synthetic answers; browser emulation, not physical phones',checks:[]};
const check=(name,value=true)=>{assert.ok(value,name);report.checks.push(name)};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){for(let i=0;i<100;i++){try{if((await fetch(base+'/api/quiz')).ok)return}catch{}await pause(100)}throw Error('Server unavailable')}
async function noOverflow(page,label){const metric=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('main *')].filter(x=>x.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(x=>({tag:x.tagName,cls:x.className,right:x.getBoundingClientRect().right}))}));if(metric.scroll>metric.width)throw Error(label+': overflow '+JSON.stringify(metric));check(label+': no horizontal overflow')}
async function answerBlock(page,block,other=false){for(const q of block.questions){const field=page.locator(`[data-question="${q.id}"]`);if(q.type==='single'||q.type==='multiple'){if(other&&q.allowOther){await field.locator('input[value="__other__"]').check();await field.locator('[data-other]').fill('Тестовое наблюдение')}else await field.locator('input[data-answer]').first().check()}else await field.locator('[data-answer]').fill('Тестовый ответ для проверки интерфейса')}}
let browsers=[];
try{
await ready();const quiz=await(await fetch(base+'/api/quiz')).json();
for(const [engine,name] of [[chromium,'chromium'],[webkit,'webkit']]){
const browser=await engine.launch({headless:true});browsers.push(browser);
const ctx=await browser.newContext({viewport:{width:1440,height:1000},locale:'ru-RU',timezoneId:'Europe/Moscow'});
const page=await ctx.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
await page.goto(base);await page.locator('[data-start]').waitFor();await page.evaluate(()=>document.fonts.ready);
if(name==='chromium')await page.screenshot({path:path.join(out,'intro-desktop.png'),fullPage:true});
await noOverflow(page,name+' desktop');
await page.setViewportSize({width:390,height:844});
if(name==='chromium')await page.screenshot({path:path.join(out,'intro-mobile.png'),fullPage:true});
await noOverflow(page,name+' mobile intro');
await page.locator('[data-play]').click();await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>.3&&!v.paused&&!v.muted});check(name+': video plays with sound enabled');await page.locator('video').evaluate(v=>v.pause());
await page.locator('[data-start]').click();await page.locator('#block-form').waitFor();
await page.locator('#block-form button[type=submit]').click();check(name+': required answer enforced',await page.locator('.question.invalid').count()>0);
await answerBlock(page,quiz.content.blocks[0]);const short=page.locator('[data-answer=\"b1q2\"]');await short.fill('а'.repeat(300));check(name+': text limit explained',await page.locator('[data-limit=\"b1q2\"]').textContent().then(v=>v.includes('Достигнут лимит')));await short.fill('Тестовый пример');
await page.locator('#block-form button[type=submit]').click();await page.getByRole('heading',{name:'Понимание речи',exact:true}).waitFor();
await page.locator('[data-back]').click();check(name+': back preserves answer',await page.locator('[data-answer="b1q1"]').first().isChecked());
await page.locator('#block-form button[type=submit]').click();await page.reload();await page.locator('[data-start]').waitFor();await page.locator('[data-start]').click();await page.getByRole('heading',{name:'Понимание речи',exact:true}).waitFor();check(name+': reload resumes actual block');
await page.setViewportSize({width:320,height:780});await noOverflow(page,name+' 320px block');await page.setViewportSize({width:390,height:844});
for(let i=1;i<quiz.content.blocks.length;i++){await answerBlock(page,quiz.content.blocks[i],i===2);if(i===2){const other=page.locator('[data-other=\"b3q1\"]');await other.fill('а'.repeat(2000));check(name+': other limit explained',await page.locator('[data-limit=\"b3q1\"]').textContent().then(v=>v.includes('Достигнут лимит')));await other.fill('Тестовый другой вариант')}if(i===1&&name==='chromium'){await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true})}await page.locator('#block-form button[type=submit]').click();}
await page.getByRole('heading',{name:'Проверьте ваши ответы'}).waitFor();check(name+': complete eight-block flow');
await noOverflow(page,name+' review');if(name==='chromium')await page.screenshot({path:path.join(out,'review-mobile.png'),fullPage:true});
await page.locator('#contact-name').fill('Тестовый родитель '+name);await page.locator('#contact-channel').fill(name+'@example.test');await page.locator('[data-contact=consent]').check();
await page.route('**/api/submissions',r=>r.abort('failed'));await page.locator('#send-button').click();await page.waitForFunction(()=>!!document.querySelector('#send-error')?.textContent);check(name+': failure does not claim success',await page.locator('#submit-form').count()===1);check(name+': failure preserves contact',await page.locator('#contact-name').inputValue()==='Тестовый родитель '+name);
await page.unroute('**/api/submissions');const reqP=page.waitForRequest(r=>r.url().endsWith('/api/submissions')&&r.method()==='POST');const resP=page.waitForResponse(r=>r.url().endsWith('/api/submissions')&&r.status()===201);await page.locator('#send-button').click();const sent=(await reqP).postDataJSON();const received=await(await resP).json();await page.getByRole('heading',{name:'Ответы получены',exact:true}).waitFor();check(name+': server-backed success');check(name+': draft cleared',await page.evaluate(()=>!localStorage.getItem('logorio-quiz-draft-v1')));const duplicate=await ctx.request.post(base+'/api/submissions',{data:sent});check(name+': duplicate returns same submission',(await duplicate.json()).id===received.id);
await page.goto(base+'/admin');await page.locator('#password').waitFor();await page.locator('#password').fill(password);await page.locator('#login-button').click();await page.locator('[data-tab=content]').waitFor();await page.getByRole('row').filter({hasText:'Тестовый родитель '+name}).locator('[data-detail]').click();await page.locator('#detail-status').selectOption('reviewed');await page.locator('#detail-note').fill('Тестовый разбор сохранён');await page.locator('#detail-form button[type=submit]').click();await page.getByText('Разбор сохранён',{exact:true}).waitFor();check(name+': review note and status saved');check(name+': visible status chip updates',await page.locator('.detail-head .status-chip').textContent()==='Разобрана');
if(name==='chromium')await page.screenshot({path:path.join(out,'admin-mobile.png'),fullPage:true});
await page.locator('[data-tab=content]').click();await page.locator('[data-edit=title]').waitFor();const title='Черновик для проверки '+name;await page.locator('[data-edit=title]').fill(title);await page.locator('[data-edit=\"blocks.0.questions.0.hint\"]').fill('Вспомните обычную ситуацию дома.');await page.locator('[data-save-content]').click();await page.getByText('Черновик сохранён',{exact:true}).waitFor();const stillPublic=await(await fetch(base+'/api/quiz')).json();check(name+': draft not published',stillPublic.content.title!==title);
await page.locator('[data-upload="blocks.0.video"]').setInputFiles(path.resolve('public/media/demo.mp4'));await page.getByText('Видео загружено. Сохраните черновик и опубликуйте версию.',{exact:true}).waitFor();check(name+': video uploaded via editor');
await noOverflow(page,name+' editor');if(name==='chromium')await page.screenshot({path:path.join(out,'editor-mobile.png'),fullPage:true});
await page.locator('[data-preview-content]').click();await page.getByRole('heading',{name:title,exact:true}).waitFor();check(name+': saved draft preview works');await page.locator('[data-start]').click();await page.getByText('Вспомните обычную ситуацию дома.',{exact:true}).waitFor();check(name+': editable question hint appears');await page.goto(base+'/admin');await page.locator('[data-tab=content]').click();await page.locator('[data-publish]').waitFor();page.once('dialog',d=>d.accept());await page.locator('[data-publish]').click();await page.waitForFunction(()=>document.querySelector('#editor-feedback')?.textContent.includes('опубликована'));const published=await(await fetch(base+'/api/quiz')).json();check(name+': publication creates version',published.version>stillPublic.version);const old=await(await fetch(base+'/api/quiz/'+quiz.version)).json();check(name+': historical quiz unchanged',old.content.title===quiz.content.title);
await page.locator('[data-tab=submissions]').click();await page.getByRole('row').filter({hasText:'Тестовый родитель '+name}).locator('[data-detail]').click();await page.locator('#detail-form').waitFor();const snapshot=await(await ctx.request.get(base+'/api/admin/submissions/'+received.id)).json();check(name+': snapshot retains original questions',await page.locator('.review-block').count()===8&&snapshot.content.title===stillPublic.content.title);
page.once('dialog',d=>d.accept());await page.locator('[data-delete]').click();await page.locator('[data-tab=content]').waitFor();const s=await ctx.request.get(base+'/api/admin/submissions/'+received.id);check(name+': delete removes test submission',s.status()===404);
await page.locator('[data-logout]').click();await page.locator('#password').waitFor();const denied=await ctx.request.get(base+'/api/admin/submissions');check(name+': logout revokes access',denied.status()===401);check(name+': no JavaScript errors',errors.length===0);
await browser.close();browsers=browsers.filter(b=>b!==browser);
}
report.result='passed';writeFileSync(path.join(out,'browser-checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({result:report.result,checks:report.checks.length,browsers:['Chromium','WebKit'],evidence:path.join(out,'browser-checks.json')}));
}catch(err){report.result='failed';report.error=err.message;writeFileSync(path.join(out,'browser-checks.json'),JSON.stringify(report,null,2));console.error(err.stack);process.exitCode=1}finally{for(const b of browsers)await b.close();server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));rmSync(data,{recursive:true,force:true})}
