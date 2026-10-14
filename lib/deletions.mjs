import {existsSync,readFileSync,openSync,writeSync,fsyncSync,closeSync,renameSync} from 'node:fs';
import path from 'node:path';
export function readDeletions(data){
 const file=path.join(data,'deleted-submissions.json');if(!existsSync(file))return [];
 const ids=JSON.parse(readFileSync(file,'utf8'));if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||!/^[a-f0-9]{32}$/.test(id)))throw Error('Invalid deletion ledger; restore or repair private ledger before startup');
 return [...new Set(ids)];
}
export function writeDeletions(data,ids){
 const file=path.join(data,'deleted-submissions.json'),temp=file+'.tmp';const fd=openSync(temp,'w',0o600);
 try{writeSync(fd,JSON.stringify([...new Set(ids)]));fsyncSync(fd);}finally{closeSync(fd);}renameSync(temp,file);
 const dir=openSync(data,'r');try{fsyncSync(dir);}finally{closeSync(dir);}
}
export function applyDeletions(db,ids){
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'").get())return;
 db.exec('BEGIN IMMEDIATE');try{const del=db.prepare('DELETE FROM submissions WHERE id=?');for(const id of ids)del.run(id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
}
