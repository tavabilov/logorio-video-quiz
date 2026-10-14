import {DatabaseSync} from 'node:sqlite';
import {existsSync,readFileSync,copyFileSync,cpSync,rmSync,renameSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {readDeletions,writeDeletions,applyDeletions} from '../lib/deletions.mjs';
const data=path.resolve(process.env.DATA_DIR||'data'),source=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!existsSync(path.join(source,'quiz.sqlite')))throw Error('Provide backup directory containing quiz.sqlite');
const pidFile=path.join(data,'server.pid');if(existsSync(pidFile)){const pid=Number(readFileSync(pidFile,'utf8'));try{process.kill(pid,0);throw Error('Stop the running server before restore');}catch(e){if(e.code!=='ESRCH')throw e;}}
mkdirSync(data,{recursive:true,mode:0o700});
// Current ledger is authoritative and is never replaced by an older backup.
const ids=[...new Set([...readDeletions(data),...readDeletions(source)])];writeDeletions(data,ids);
const staging=path.join(data,'restore-staging.sqlite');copyFileSync(path.join(source,'quiz.sqlite'),staging);
const db=new DatabaseSync(staging);try{applyDeletions(db,ids);db.exec('DELETE FROM sessions');db.exec('PRAGMA wal_checkpoint(TRUNCATE); PRAGMA journal_mode=DELETE;');}finally{db.close();}
const uploadStaging=path.join(data,'restore-staging-uploads');rmSync(uploadStaging,{recursive:true,force:true});if(existsSync(path.join(source,'uploads')))cpSync(path.join(source,'uploads'),uploadStaging,{recursive:true});else mkdirSync(uploadStaging);
for(const suffix of ['-wal','-shm'])rmSync(path.join(data,'quiz.sqlite'+suffix),{force:true});renameSync(staging,path.join(data,'quiz.sqlite'));rmSync(path.join(data,'uploads'),{recursive:true,force:true});renameSync(uploadStaging,path.join(data,'uploads'));rmSync(pidFile,{force:true});
console.log('Резервная копия восстановлена. Удалённые анкеты исключены, сессии завершены.');
