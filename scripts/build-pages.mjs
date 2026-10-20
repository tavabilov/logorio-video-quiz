import{cpSync,readFileSync,writeFileSync,mkdirSync,rmSync}from'node:fs';
import{createHash}from'node:crypto';
const base=process.env.PAGES_BASE||'/logorio-video-quiz/';if(!/^\/[a-zA-Z0-9_-]+\/$/.test(base))throw Error('Invalid PAGES_BASE');
const receiver=process.env.GOOGLE_RECEIVER_URL||'';if(receiver&&!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(receiver))throw Error('Invalid receiver URL');
rmSync('dist',{recursive:true,force:true});mkdirSync('dist');cpSync('public','dist',{recursive:true,filter:src=>!/(^|\/)publish(\/|$)/.test(src)});
const version=3;
const content=JSON.parse(readFileSync('content/quiz.json'));const released=JSON.parse(readFileSync('content/versions/'+version+'.json'));if(JSON.stringify(content)!==JSON.stringify(released))throw Error('Published version differs from its immutable snapshot. Create a new coordinated version before building.');for(const b of content.blocks){b.video=base+b.video.slice(1);if(b.poster)b.poster=base+b.poster.slice(1)}if(content.introVideo)content.introVideo=base+content.introVideo.slice(1);
content.completionText='Ответы поступили в закрытую Google Таблицу центра. Порядок обратной связи будет добавлен после согласования.';
const versions={};for(let n=1;n<version;n++){const archived=JSON.parse(readFileSync('content/versions/'+n+'.json'));for(const block of archived.blocks){block.video=base+block.video.slice(1);if(block.poster)block.poster=base+block.poster.slice(1)}if(archived.introVideo)archived.introVideo=base+archived.introVideo.slice(1);versions[n]={version:n,content:archived}}
writeFileSync('dist/static-config.js','window.LOGORIO_STATIC='+JSON.stringify({base,version,receiver,content,versions})+';\n');
let html=readFileSync('dist/index.html','utf8').replace('<script type="module" src="/app.js"></script>','<script src="'+base+'static-config.js" defer></script><script src="'+base+'google-bridge.js" defer></script><script type="module" src="'+base+'app.js"></script>').replace(/(href|src)="\//g,'$1="'+base);html=html.replaceAll(base+base.slice(1),base);
writeFileSync('dist/styles.css',readFileSync('dist/styles.css','utf8').replaceAll("url('/","url('"+base));
for(const asset of ['styles.css','app.js','static-config.js','google-bridge.js']){const hash=createHash('sha256').update(readFileSync('dist/'+asset)).digest('hex').slice(0,12);html=html.replaceAll('"'+base+asset+'"','"'+base+asset+'?v='+hash+'"');}writeFileSync('dist/index.html',html);
let privacy=readFileSync('dist/privacy.html','utf8').replaceAll('href="/','href="'+base).replace('на локальном сервере и доступны в закрытом кабинете сотрудников','в закрытой Google Таблице, доступной сотрудникам центра');privacy=privacy.replace(base+'styles.css\"',base+'styles.css?v='+createHash('sha256').update(readFileSync('dist/styles.css')).digest('hex').slice(0,12)+'\"');writeFileSync('dist/privacy.html',privacy);
mkdirSync('dist/admin');writeFileSync('dist/admin/index.html',html);writeFileSync('dist/.nojekyll','');
console.log('GitHub Pages bundle ready; Google receiver '+(receiver?'configured':'pending'));
